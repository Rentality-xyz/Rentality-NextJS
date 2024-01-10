import { ClaimType } from "./ContractFullClaimInfo";

export type ContractCreateClaimRequest = {
  tripId: bigint;
  claimType: ClaimType;
  description: string;
  amountInUsdCents: bigint;
};

export type CreateClaimRequest = {
  tripId: number;
  claimType: ClaimType;
  description: string;
  amountInUsdCents: number;
};
