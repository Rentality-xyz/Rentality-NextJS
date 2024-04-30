import { useEffect, useMemo, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "@/model/Claim";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {ContractCreateClaimRequest, ContractFullClaimInfo} from "@/model/blockchain/schemas";
import { validateContractFullClaimInfo } from "@/model/blockchain/schemas_utils";
import {CreateClaimRequest, TripInfoForClaimCreation} from "@/model/CreateClaimRequest";
import encodeClaimChatMessage from "@/components/chat/utils";
import {useChat} from "@/contexts/chatContext";

const useGuestClaims = () => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [claims, setClaims] = useState<Claim[]>([]);
  const chatContextInfo = useChat();
  const [tripInfos, setTripInfos] = useState<TripInfoForClaimCreation[]>([
    { tripId: 0, guestAddress: "", tripDescription: "Loading...", tripStart: new Date() },
  ]);

  const payClaim = async (claimId: number) => {
    if (!ethereumInfo) {
      console.error("payClaim error: ethereumInfo is null");
      return false;
    }
    if (!rentalityContract) {
      console.error("payClaim error: rentalityContract is null");
      return false;
    }

    try {
      const claimAmountInEth = claims.find((i) => i.claimId === claimId)?.amountInEth ?? 0;

      let transaction = await rentalityContract.payClaim(BigInt(claimId), {
        value: claimAmountInEth,
      });

      await transaction.wait();
      return true;
    } catch (e) {
      console.error("payClaim error:" + e);
      return false;
    }
  };

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

      const transaction = await rentalityContract.createClaim(claimRequest);
      await transaction.wait();

      const message = encodeClaimChatMessage(createClaimRequest);
      chatContextInfo.sendMessage(createClaimRequest.guestAddress, createClaimRequest.tripId, message);
      return true;
    } catch (e) {
      console.error("createClaim error:" + e);
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
        const claimsView: ContractFullClaimInfo[] = await rentalityContract.getMyClaimsAsGuest();

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
                    amountInEth: i.amountInEth,
                    payDateInSec: Number(i.claim.payDateInSec),
                    rejectedBy: i.claim.rejectedBy,
                    rejectedDateInSec: Number(i.claim.rejectedDateInSec),
                    hostPhoneNumber: formatPhoneNumber(i.hostPhoneNumber),
                    guestPhoneNumber: formatPhoneNumber(i.guestPhoneNumber),
                  };
                  return item;
                })
              );

        return claimsData;
      } catch (e) {
        console.error("getClaims error:" + e);
      }
    };

    if (!rentalityContract) return;

    setIsLoading(true);

    getClaims(rentalityContract)
      .then((data) => {
        setClaims(data ?? []);
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

  return [isLoading, sortedClaims, sortedTripInfos, payClaim, createClaim] as const;
};

export default useGuestClaims;
