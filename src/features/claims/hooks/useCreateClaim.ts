import { useEffect, useMemo, useState } from "react";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateClaimRequest, ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { CreateClaimRequest, TripInfoForClaimCreation } from "@/features/claims/models/CreateClaimRequest";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { FileToUpload } from "@/model/FileToUpload";
import { useTranslation } from "react-i18next";

const useCreateClaim = (isHost: boolean) => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  const [tripInfos, setTripInfos] = useState<TripInfoForClaimCreation[]>([
    { tripId: 0, guestAddress: "", tripDescription: t("common.info.loading"), tripStart: new Date() },
  ]);

  async function createClaim(createClaimRequest: CreateClaimRequest): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("createClaim error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContracts) {
      console.error("createClaim error: rentalityContract is null");
      return Err("ERROR");
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      console.error("createClaim error: user don't have enough funds");
      return Err("NOT_ENOUGH_FUNDS");
    }

    try {
      const savedFiles = await saveClaimFiles(createClaimRequest.localFileUrls, ethereumInfo);

      const claimRequest: ContractCreateClaimRequest = {
        tripId: BigInt(createClaimRequest.tripId),
        claimType: createClaimRequest.claimType,
        description: createClaimRequest.description,
        amountInUsdCents: BigInt(createClaimRequest.amountInUsdCents),
        photosUrl: savedFiles.join("|"),
      };

      const transaction = await rentalityContracts.gateway.createClaim(claimRequest);
      await transaction.wait();

      // const message = encodeClaimChatMessage(createClaimRequest);
      // chatContextInfo.sendMessage(
      //   createClaimRequest.guestAddress,
      //   createClaimRequest.tripId,
      //   message,
      //   "SYSTEM|CLAIM_REQUEST"
      // );
      return Ok(true);
    } catch (e) {
      console.error("createClaim error:" + e);
      return Err("ERROR");
    }
  }

  useEffect(() => {
    const getTripsForClaims = async (rentalityContracts: IRentalityContracts) => {
      try {
        if (!rentalityContracts) {
          console.error("getClaims error: contract is null");
          return;
        }

        const guestTripsView: ContractTripDTO[] = (await rentalityContracts.gateway.getTripsAs(isHost)).filter(
          (i) => i.trip.status !== TripStatus.Pending && i.trip.status !== TripStatus.Rejected
        );

        const guestTripsData =
          guestTripsView.length === 0
            ? []
            : await Promise.all(
                guestTripsView.map(async (i: ContractTripDTO, index) => {
                  if (index === 0) {
                    validateContractTripDTO(i);
                  }

                  const tripStart = getDateFromBlockchainTimeWithTZ(i.trip.startDateTime, i.timeZoneId);
                  const tripEnd = getDateFromBlockchainTimeWithTZ(i.trip.endDateTime, i.timeZoneId);

                  let item: TripInfoForClaimCreation = {
                    tripId: Number(i.trip.tripId),
                    guestAddress: i.trip.guest,
                    tripDescription: `${i.brand} ${i.model} ${i.yearOfProduction} ${i.trip.guestName} trip ${dateRangeFormatShortMonthDateYear(
                      tripStart,
                      tripEnd,
                      i.timeZoneId
                    )}`,
                    tripStart: tripStart,
                  };
                  return item;
                })
              );

        return guestTripsData;
      } catch (e) {
        console.error("getClaims error:" + e);
      }
    };

    if (!rentalityContracts) return;

    setIsLoading(true);

    getTripsForClaims(rentalityContracts)
      .then((data) => {
        setTripInfos(data ?? []);
      })
      .finally(() => setIsLoading(false));
  }, [rentalityContracts, isHost]);

  const sortedTripInfos = useMemo(() => {
    return [...tripInfos].sort((a, b) => {
      return b.tripStart.getTime() - a.tripStart.getTime();
    });
  }, [tripInfos]);

  return {
    isLoading,
    tripInfos: sortedTripInfos,
    createClaim,
  } as const;
};

async function saveClaimFiles(filesToSave: FileToUpload[], ethereumInfo: EthereumInfo): Promise<string[]> {
  filesToSave = filesToSave.filter((i) => i);

  const savedFiles: string[] = [];

  if (filesToSave.length > 0) {
    for (const file of filesToSave) {
      const response = await uploadFileToIPFS(file.file, "RentalityClaimFile", {
        createdAt: new Date().toISOString(),
        createdBy: ethereumInfo?.walletAddress ?? "",
        version: SMARTCONTRACT_VERSION,
        chainId: ethereumInfo?.chainId ?? 0,
      });

      if (!response.success || !response.pinataURL) {
        throw new Error("Uploaded image to Pinata error");
      }
      savedFiles.push(response.pinataURL);
    }
  }
  return savedFiles;
}

export default useCreateClaim;
