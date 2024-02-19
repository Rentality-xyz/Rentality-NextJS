import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract, IRentalityCurrencyConverterContract } from "@/model/blockchain/IRentalityContract";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import { getEtherContract } from "@/abis";
import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "@/model/Claim";
import { ContractFullClaimInfo, validateContractFullClaimInfo } from "@/model/blockchain/ContractClaimInfo";

const useGuestClaims = () => {
  const rentalityInfo = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [claims, setClaims] = useState<Claim[]>([]);

  const payClaim = async (claimId: number) => {
    if (!rentalityInfo) {
      console.error("payClaim error: rentalityInfo is null");
      return false;
    }

    try {
      const rentalityCurrencyConverterContract = (await getEtherContract(
        "currencyConverter"
      )) as unknown as IRentalityCurrencyConverterContract;

      if (rentalityCurrencyConverterContract == null) {
        console.error("payClaim error: rentalityCurrencyConverterContract is null");
        return false;
      }

      const claimAmountInUsdCents = claims.find((i) => i.claimId === claimId)?.amountInUsdCents ?? 0;
      const { valueInEth } = await rentalityCurrencyConverterContract.getEthFromUsdLatest(
        BigInt(claimAmountInUsdCents)
      );

      let transaction = await rentalityInfo.rentalityContract.payClaim(BigInt(claimId), {
        value: valueInEth,
      });

      await transaction.wait();
      return true;
    } catch (e) {
      console.error("payClaim error:" + e);
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

    if (!rentalityInfo) return;

    setIsLoading(true);

    getClaims(rentalityInfo.rentalityContract)
      .then((data) => {
        setClaims(data ?? []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityInfo]);

  return [isLoading, claims, payClaim] as const;
};

export default useGuestClaims;
