import { FileToUpload } from "./FileToUpload";
import { ClaimType } from "./blockchain/schemas";

export type CreateClaimRequest = {
  tripId: number;
  guestAddress: string;
  claimType: ClaimType;
  description: string;
  amountInUsdCents: number;
  localFileUrls: FileToUpload[];
};

export type TripInfoForClaimCreation = {
  tripId: number;
  tripDescription: string;
  tripStart: Date;
  guestAddress: string;
};
