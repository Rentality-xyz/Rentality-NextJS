import { ClaimType } from "@/model/blockchain/schemas";
import { FileToUpload } from "@/model/FileToUpload";

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
