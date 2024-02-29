import { ClaimType } from "./Claim";

export type CreateClaimRequest = {
  tripId: number;
  guestAddress: string;
  claimType: ClaimType;
  description: string;
  amountInUsdCents: number;
};

export type TripInfoForClaimCreation = {
  tripId: number;
  tripDescription: string;
  tripStart: Date;
  guestAddress: string;
};
