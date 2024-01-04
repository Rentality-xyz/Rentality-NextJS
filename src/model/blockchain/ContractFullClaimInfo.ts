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
  claimType: bigint; //ContractClaimType
  status: bigint; //ContractClaimStatus
  description: string;
  amountInUsdCents: bigint;
  payDateInSec: bigint;
  RejectedBy: string;
  rejectedDateInSec: bigint;
};

export enum ContractClaimType {
  Tolls,
  Tickets,
  LateReturn,
  Cleanliness,
  Smoking,
  ExteriorDamage,
  InteriorDamage,
  Other,
}

export enum ContractClaimStatus {
  NotPaid,
  Paid,
  Cancel,
  Overdue,
}
