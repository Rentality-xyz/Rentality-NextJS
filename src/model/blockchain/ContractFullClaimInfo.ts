import { validateType } from "@/utils/typeValidator";

export type ContractFullClaimInfo = {
  claim: ContractClaim;
  host: string;
  guest: string;
  carBrand: string;
  carModel: string;
  carYearOfProduction: bigint;
};

export type ContractClaim = {
  tripId: bigint;
  claimId: bigint;
  deadlineDateInSec: bigint;
  claimType: ClaimType;
  status: ClaimStatus;
  carInfo: string;
  description: string;
  amountInUsdCents: bigint;
  payDateInSec: bigint;
  rejectedBy: string;
  rejectedDateInSec: bigint;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
};

export type Claim = {
  tripId: number;
  claimId: number;
  deadlineDate: Date;
  claimType: ClaimType;
  claimTypeText: string;
  status: ClaimStatus;
  statusText: string;
  carInfo: string;
  description: string;
  amountInUsd: string;
  payDateInSec: number;
  rejectedBy: string;
  rejectedDateInSec: number;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
};

export enum ClaimType {
  Tolls,
  Tickets,
  LateReturn,
  Cleanliness,
  Smoking,
  ExteriorDamage,
  InteriorDamage,
  Other,
}

export const getClaimTypeTextFromClaimType = (status: ClaimType) => {
  switch (status) {
    case ClaimType.Tolls:
      return "Tolls";
    case ClaimType.Tickets:
      return "Tickets";
    case ClaimType.LateReturn:
      return "Late return";
    case ClaimType.Cleanliness:
      return "Cleanliness";
    case ClaimType.Smoking:
      return "Smoking";
    case ClaimType.ExteriorDamage:
      return "Exterior damage";
    case ClaimType.InteriorDamage:
      return "Interior damage";
    case ClaimType.Other:
    default:
      return "Other";
  }
};

export enum ClaimStatus {
  NotPaid,
  Paid,
  Cancel,
  Overdue,
}

export const getClaimStatusTextFromStatus = (status: ClaimStatus) => {
  switch (status) {
    case ClaimStatus.Paid:
      return "Paid";
    case ClaimStatus.Overdue:
      return "Overdue";
    case ClaimStatus.Cancel:
      return "Cancel";
    case ClaimStatus.NotPaid:
    default:
      return "Not Paid";
  }
};

export function validateContractClaim(obj: ContractClaim): obj is ContractClaim {
  const emptyContractClaim: ContractClaim = {
    tripId: BigInt(0),
    claimId: BigInt(0),
    deadlineDateInSec: BigInt(0),
    claimType: ClaimType.Tolls,
    status: ClaimStatus.NotPaid,
    carInfo: "",
    description: "",
    amountInUsdCents: BigInt(0),
    payDateInSec: BigInt(0),
    rejectedBy: "",
    rejectedDateInSec: BigInt(0),
    hostPhoneNumber: "",
    guestPhoneNumber: "",
  };

  return validateType(obj, emptyContractClaim);
}
