import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { ethers } from "ethers";
import { getContract } from "@/abis";
import { Claim, getClaimStatusTextFromStatus, getClaimTypeTextFromClaimType } from "@/model/Claim";
import { ContractFullClaimInfo, validateContractFullClaimInfo } from "@/model/blockchain/ContractClaimInfo";

// const claimsViewTEST: ContractClaim[] = [
//   {
//     claimId: BigInt(0),
//     claimType: ClaimType.Tolls,
//     deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime() / 1000)),
//     tripId: BigInt(3333),
//     description: "Toll road bill",
//     amountInUsdCents: BigInt(2500),
//     status: ClaimStatus.NotPaid,
//     payDateInSec: BigInt(0),
//     rejectedBy: "",
//     rejectedDateInSec: BigInt(0),
//   },
//   {
//     claimId: BigInt(1),
//     claimType: ClaimType.Tickets,
//     deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime() / 1000)),
//     tripId: BigInt(2222),
//     // carInfo: "Ford Bronco 2022",
//     description: "Parking fine",
//     amountInUsdCents: BigInt(1000),
//     status: ClaimStatus.Paid,
//     payDateInSec: BigInt(0),
//     rejectedBy: "",
//     rejectedDateInSec: BigInt(0),
//     // hostPhoneNumber: "+123456789",
//     // guestPhoneNumber: "+987654321",
//   },
//   {
//     claimId: BigInt(2),
//     claimType: ClaimType.ExteriorDamage,
//     deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() - 1000 * 60 * 60 * 24).getTime() / 1000)),
//     tripId: BigInt(1111),
//     // carInfo: "Ford Bronco 2022",
//     description: "Front bumper scratched",
//     amountInUsdCents: BigInt(150000),
//     status: ClaimStatus.Overdue,
//     payDateInSec: BigInt(0),
//     rejectedBy: "",
//     rejectedDateInSec: BigInt(0),
//     // hostPhoneNumber: "+123456789",
//     // guestPhoneNumber: "+987654321",
//   },
//   {
//     claimId: BigInt(3),
//     claimType: ClaimType.ExteriorDamage,
//     deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() - 1000 * 60 * 60 * 24).getTime() / 1000)),
//     tripId: BigInt(1111),
//     // carInfo: "Ford Bronco 2022",
//     description: "Front bumper scratched",
//     amountInUsdCents: BigInt(150000),
//     status: ClaimStatus.Cancel,
//     payDateInSec: BigInt(0),
//     rejectedBy: "",
//     rejectedDateInSec: BigInt(0),
//     // hostPhoneNumber: "+123456789",
//     // guestPhoneNumber: "+987654321",
//   },
// ];

const useGuestClaims = () => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [claims, setClaims] = useState<Claim[]>([]);

  const getRentalityCurrencyConverterContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = await provider.getSigner();

      const rentalityCurrencyConverterContract = await getContract("currencyConverter", signer);

      if (rentalityCurrencyConverterContract === null) {
        return;
      }
      return rentalityCurrencyConverterContract;
    } catch (e) {
      console.error("getRentalityCurrencyConverter error:" + e);
    }
  };

  const payClaim = async (claimId: number) => {
    if (!rentalityInfo) {
      console.error("payClaim error: rentalityInfo is null");
      return false;
    }

    try {
      const rentalityCurrencyConverterContract = await getRentalityCurrencyConverterContract();

      if (rentalityCurrencyConverterContract == null) {
        console.error("payClaim error: rentalityCurrencyConverterContract is null");
        return false;
      }

      const claimAmountInUsdCents = claims.find((i) => i.claimId === claimId)?.amountInUsdCents ?? 0;
      const [claimAmountInEth, ethToCurrencyRate, ethToCurrencyDecimals] =
        await rentalityCurrencyConverterContract.getEthFromUsdLatest(claimAmountInUsdCents);

      let transaction = await rentalityInfo.rentalityContract.payClaim(BigInt(claimId), {
        value: claimAmountInEth,
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

                  console.log("i:", i);
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
                    hostPhoneNumber: i.hostPhoneNumber,
                    guestPhoneNumber: i.guestPhoneNumber,
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

    setDataFetched(false);

    getClaims(rentalityInfo.rentalityContract)
      .then((data) => {
        setClaims(data ?? []);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, [rentalityInfo]);

  return [dataFetched, claims, payClaim] as const;
};

export default useGuestClaims;
