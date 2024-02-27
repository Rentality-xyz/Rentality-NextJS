import { useEffect, useMemo, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract, IRentalityCurrencyConverterContract } from "@/model/blockchain/IRentalityContract";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import { getEtherContractWithSigner } from "@/abis";
import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "@/model/Claim";
import { ContractFullClaimInfo, validateContractFullClaimInfo } from "@/model/blockchain/ContractClaimInfo";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { formatEthWithDecimals } from "@/utils/numericFormatters";
import { formatEther } from "ethers";

const useGuestClaims = () => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [claims, setClaims] = useState<Claim[]>([]);

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
      const rentalityCurrencyConverterContract = (await getEtherContractWithSigner(
        "currencyConverter",
        ethereumInfo.signer
      )) as unknown as IRentalityCurrencyConverterContract;

      if (rentalityCurrencyConverterContract == null) {
        console.error("payClaim error: rentalityCurrencyConverterContract is null");
        return false;
      }

      const claimAmountInUsdCents = claims.find((i) => i.claimId === claimId)?.amountInUsdCents ?? 0;

      const { valueInEth, ethToUsdRate, ethToUsdDecimals } =
        await rentalityCurrencyConverterContract.getEthFromUsdLatest(BigInt(claimAmountInUsdCents));

      console.log(`valueInEth: ${typeof valueInEth}`);
      console.log(`ethToUsdRate: ${typeof ethToUsdRate}`);
      console.log(`ethToUsdDecimals: ${typeof ethToUsdDecimals}`);

      console.log(
        `paying $${(claimAmountInUsdCents / 100).toFixed(2)} = ${formatEther(
          valueInEth
        )} ETH (with rate ${formatEthWithDecimals(ethToUsdRate, ethToUsdDecimals)} USD/ETH)...`
      );

      let transaction = await rentalityContract.payClaim(BigInt(claimId), {
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

  return [isLoading, sortedClaims, payClaim] as const;
};

export default useGuestClaims;
