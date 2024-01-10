import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import {
  Claim,
  ContractClaim,
  ClaimStatus,
  ClaimType,
  validateContractClaim,
  getClaimTypeTextFromClaimType,
  getClaimStatusTextFromStatus,
} from "@/model/blockchain/ContractFullClaimInfo";
import { getDateFromBlockchainTime, getStringFromMoneyInCents } from "@/utils/formInput";

const claimsViewTEST: ContractClaim[] = [
  {
    claimId: BigInt(0),
    claimType: ClaimType.Tolls,
    deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime() / 1000)),
    tripId: BigInt(3333),
    carInfo: "Ford Bronco 2022",
    description: "Toll road bill",
    amountInUsdCents: BigInt(2500),
    status: ClaimStatus.NotPaid,
    payDateInSec: BigInt(0),
    rejectedBy: "",
    rejectedDateInSec: BigInt(0),
    hostPhoneNumber: "+123456789",
    guestPhoneNumber: "+987654321",
  },
  {
    claimId: BigInt(1),
    claimType: ClaimType.Tickets,
    deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime() / 1000)),
    tripId: BigInt(2222),
    carInfo: "Ford Bronco 2022",
    description: "Parking fine",
    amountInUsdCents: BigInt(1000),
    status: ClaimStatus.Paid,
    payDateInSec: BigInt(0),
    rejectedBy: "",
    rejectedDateInSec: BigInt(0),
    hostPhoneNumber: "+123456789",
    guestPhoneNumber: "+987654321",
  },
  {
    claimId: BigInt(2),
    claimType: ClaimType.ExteriorDamage,
    deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() - 1000 * 60 * 60 * 24).getTime() / 1000)),
    tripId: BigInt(1111),
    carInfo: "Ford Bronco 2022",
    description: "Front bumper scratched",
    amountInUsdCents: BigInt(150000),
    status: ClaimStatus.Overdue,
    payDateInSec: BigInt(0),
    rejectedBy: "",
    rejectedDateInSec: BigInt(0),
    hostPhoneNumber: "+123456789",
    guestPhoneNumber: "+987654321",
  },
  {
    claimId: BigInt(3),
    claimType: ClaimType.ExteriorDamage,
    deadlineDateInSec: BigInt(Math.floor(new Date(new Date().getTime() - 1000 * 60 * 60 * 24).getTime() / 1000)),
    tripId: BigInt(1111),
    carInfo: "Ford Bronco 2022",
    description: "Front bumper scratched",
    amountInUsdCents: BigInt(150000),
    status: ClaimStatus.Cancel,
    payDateInSec: BigInt(0),
    rejectedBy: "",
    rejectedDateInSec: BigInt(0),
    hostPhoneNumber: "+123456789",
    guestPhoneNumber: "+987654321",
  },
];

const useGuestClaims = () => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [claims, setClaims] = useState<Claim[]>([]);

  const payClaim = async (claimId: number) => {};

  useEffect(() => {
    const getClaims = async (rentalityContract: IRentalityContract) => {
      try {
        if (rentalityContract == null) {
          console.error("getClaims error: contract is null");
          return;
        }
        const claimsView: ContractClaim[] = claimsViewTEST; //await rentalityContract.getMyClaimsAsGuest();

        const claimsData =
          claimsView.length === 0
            ? []
            : await Promise.all(
                claimsView.map(async (i: ContractClaim, index) => {
                  if (index === 0) {
                    validateContractClaim(i);
                  }

                  let item: Claim = {
                    claimId: Number(i.claimId),
                    tripId: Number(i.tripId),
                    deadlineDate: getDateFromBlockchainTime(i.deadlineDateInSec),
                    claimType: i.claimType,
                    claimTypeText: getClaimTypeTextFromClaimType(i.claimType),
                    status: i.status,
                    statusText: getClaimStatusTextFromStatus(i.status),
                    carInfo: i.carInfo,
                    description: i.description,
                    amountInUsd: getStringFromMoneyInCents(i.amountInUsdCents),
                    payDateInSec: Number(i.payDateInSec),
                    rejectedBy: i.rejectedBy,
                    rejectedDateInSec: Number(i.rejectedDateInSec),
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
