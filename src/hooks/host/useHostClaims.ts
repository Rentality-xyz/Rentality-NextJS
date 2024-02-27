import { useEffect, useMemo, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractFullClaimInfo, validateContractFullClaimInfo } from "@/model/blockchain/ContractClaimInfo";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import {
  ContractCreateClaimRequest,
  CreateClaimRequest,
  TripInfoForClaimCreation,
} from "@/model/blockchain/ContractCreateClaimRequest";
import { ContractTrip, validateContractTrip } from "@/model/blockchain/ContractTrip";
import { getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { dateRangeFormatDayMonth } from "@/utils/datetimeFormatters";
import { TripStatus } from "@/model/TripInfo";
import { Claim, getClaimTypeTextFromClaimType, getClaimStatusTextFromStatus } from "@/model/Claim";
import { useChat } from "@/contexts/chatContext";
import encodeClaimChatMessage from "@/components/chat/utils";

const useHostClaims = () => {
  const rentalityContract = useRentality();
  const chatContextInfo = useChat();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [tripInfos, setTripInfos] = useState<TripInfoForClaimCreation[]>([
    { tripId: 0, guestAddress: "", tripDescription: "Loading...", tripStart: new Date() },
  ]);

  const [claims, setClaims] = useState<Claim[]>([]);

  const createClaim = async (createClaimRequest: CreateClaimRequest) => {
    if (rentalityContract === null) {
      console.error("createClaim: rentalityContract is null");
      return false;
    }

    try {
      const claimRequest: ContractCreateClaimRequest = {
        tripId: BigInt(createClaimRequest.tripId),
        claimType: createClaimRequest.claimType,
        description: createClaimRequest.description,
        amountInUsdCents: BigInt(createClaimRequest.amountInUsdCents),
      };

      let transaction = await rentalityContract.createClaim(claimRequest);
      await transaction.wait();

      const message = encodeClaimChatMessage(createClaimRequest);
      chatContextInfo.sendMessage(createClaimRequest.guestAddress, createClaimRequest.tripId, message);
      return true;
    } catch (e) {
      console.error("createClaim error:" + e);
      return false;
    }
  };

  const cancelClaim = async (claimId: number) => {
    if (!rentalityContract) {
      console.error("cancelClaim error: rentalityContract is null");
      return false;
    }

    try {
      let transaction = await rentalityContract.rejectClaim(BigInt(claimId));

      await transaction.wait();
      return true;
    } catch (e) {
      console.error("cancelClaim error:" + e);
      return false;
    }
  };

  useEffect(() => {
    const getClaims = async (rentalityContract: IRentalityContract) => {
      try {
        if (rentalityContract == null) {
          console.error("getClaims error: contract is null");
          return;
        }
        const claimsView: ContractFullClaimInfo[] = await rentalityContract.getMyClaimsAsHost();

        const claimsData =
          claimsView.length === 0
            ? []
            : await Promise.all(
                claimsView.map(async (i: ContractFullClaimInfo, index) => {
                  if (index === 0) {
                    validateContractFullClaimInfo(i);
                  }

                  let item: Claim = {
                    claimId: Number(i.claim.claimId),
                    tripId: Number(i.claim.tripId),
                    deadlineDate: getDateFromBlockchainTime(i.claim.deadlineDateInSec),
                    claimType: i.claim.claimType,
                    claimTypeText: getClaimTypeTextFromClaimType(i.claim.claimType),
                    status: i.claim.status,
                    statusText: getClaimStatusTextFromStatus(i.claim.status),
                    carInfo: `${i.carInfo.brand} ${i.carInfo.model} ${i.carInfo.yearOfProduction}`,
                    description: i.claim.description,
                    amountInUsdCents: Number(i.claim.amountInUsdCents),
                    payDateInSec: Number(i.claim.payDateInSec),
                    rejectedBy: i.claim.rejectedBy,
                    rejectedDateInSec: Number(i.claim.rejectedDateInSec),
                    hostPhoneNumber: formatPhoneNumber(i.hostPhoneNumber),
                    guestPhoneNumber: formatPhoneNumber(i.guestPhoneNumber),
                  };
                  return item;
                })
              );

        const hostTripsView: ContractTrip[] = (await rentalityContract.getTripsAsHost()).filter(
          (i) => i.status !== TripStatus.Pending
        );

        const hostTripsData =
          hostTripsView.length === 0
            ? []
            : await Promise.all(
                hostTripsView.map(async (i: ContractTrip, index) => {
                  if (index === 0) {
                    validateContractTrip(i);
                  }

                  const tokenURI = await rentalityContract.getCarMetadataURI(i.carId);
                  const meta = await getMetaDataFromIpfs(tokenURI);

                  const brand = meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "";
                  const model = meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "";
                  const year = meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "";
                  const guestName = i.guestName;
                  const tripStart = getDateFromBlockchainTime(i.startDateTime);
                  const tripEnd = getDateFromBlockchainTime(i.endDateTime);

                  let item: TripInfoForClaimCreation = {
                    tripId: Number(i.tripId),
                    guestAddress: i.guest,
                    tripDescription: `${brand} ${model} ${year} ${guestName} trip ${dateRangeFormatDayMonth(
                      tripStart,
                      tripEnd
                    )}`,
                    tripStart: tripStart,
                  };
                  return item;
                })
              );

        return { hostTripsData, claimsData };
      } catch (e) {
        console.error("getClaims error:" + e);
      }
    };

    if (!rentalityContract) return;

    setIsLoading(true);

    getClaims(rentalityContract)
      .then((data) => {
        setClaims(data?.claimsData ?? []);
        setTripInfos(data?.hostTripsData ?? []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContract]);

  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      return b.deadlineDate.getTime() - a.deadlineDate.getTime();
    });
  }, [claims]);

  const sortedTripInfos = useMemo(() => {
    return [...tripInfos].sort((a, b) => {
      return b.tripStart.getTime() - a.tripStart.getTime();
    });
  }, [tripInfos]);

  return [isLoading, sortedClaims, sortedTripInfos, createClaim, cancelClaim] as const;
};

export default useHostClaims;
