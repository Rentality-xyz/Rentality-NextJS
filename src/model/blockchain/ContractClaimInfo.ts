import { validateType } from "@/utils/typeValidator";
import { ContractCarInfo, emptyContractCarInfo } from "./ContractCarInfo";
import { ClaimStatus, ClaimType } from "../Claim";

export type ContractFullClaimInfo = {
  claim: ContractClaim;
  host: string;
  guest: string;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
  carInfo: ContractCarInfo;
};

export type ContractClaim = {
  tripId: bigint;
  claimId: bigint;
  deadlineDateInSec: bigint;
  claimType: ClaimType;
  status: ClaimStatus;
  description: string;
  amountInUsdCents: bigint;
  payDateInSec: bigint;
  rejectedBy: string;
  rejectedDateInSec: bigint;
};

export function validateContractClaim(obj: ContractClaim): obj is ContractClaim {
  const emptyContractClaim: ContractClaim = {
    tripId: BigInt(0),
    claimId: BigInt(0),
    deadlineDateInSec: BigInt(0),
    claimType: ClaimType.Tolls,
    status: ClaimStatus.NotPaid,
    description: "",
    amountInUsdCents: BigInt(0),
    payDateInSec: BigInt(0),
    rejectedBy: "",
    rejectedDateInSec: BigInt(0),
  };

  return validateType(obj, emptyContractClaim);
}

export function validateContractFullClaimInfo(obj: ContractFullClaimInfo): obj is ContractFullClaimInfo {
  const emptyContractFullClaimInfo: ContractFullClaimInfo = {
    claim: {
      tripId: BigInt(0),
      claimId: BigInt(0),
      deadlineDateInSec: BigInt(0),
      claimType: ClaimType.Tolls,
      status: ClaimStatus.NotPaid,
      description: "",
      amountInUsdCents: BigInt(0),
      payDateInSec: BigInt(0),
      rejectedBy: "",
      rejectedDateInSec: BigInt(0),
    },

    host: "",
    guest: "",
    hostPhoneNumber: "",
    guestPhoneNumber: "",
    carInfo: emptyContractCarInfo,
  };

  return validateType(obj, emptyContractFullClaimInfo);
}
