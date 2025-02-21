import { useEffect, useMemo, useState } from "react";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "@/features/claims/models";
import { ContractFullClaimInfo } from "@/model/blockchain/schemas";
import { validateContractFullClaimInfo } from "@/model/blockchain/schemas_utils";
import { getIpfsURI } from "@/utils/ipfsUtils";

const useFetchGuestClaims = () => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [claims, setClaims] = useState<Claim[]>([]);

  function updateData() {
    setUpdateRequired(true);
  }

  useEffect(() => {
    const getClaims = async (rentalityContracts: IRentalityContracts) => {
      try {
        if (!rentalityContracts) {
          console.error("getClaims error: contract is null");
          return;
        }
        const claimsView: ContractFullClaimInfo[] = await rentalityContracts.gateway.getMyClaimsAs(false);

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
                    isIncomingClaim: i.claim.isHostClaims,
                    fileUrls: i.claim.photosUrl.split("|").map((url) => getIpfsURI(url)),
                    timeZoneId: i.timeZoneId,
                  };
                  return item;
                })
              );

        return claimsData;
      } catch (e) {
        console.error("getClaims error:" + e);
      }
    };

    if (!updateRequired) return;
    if (!rentalityContracts) return;

    setUpdateRequired(false);
    setIsLoading(true);

    getClaims(rentalityContracts)
      .then((data) => {
        setClaims(data ?? []);
      })
      .finally(() => setIsLoading(false));
  }, [updateRequired, rentalityContracts]);

  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => {
      return b.deadlineDate.getTime() - a.deadlineDate.getTime();
    });
  }, [claims]);

  return {
    isLoading,
    claims: sortedClaims,
    updateData,
  } as const;
};

export default useFetchGuestClaims;
