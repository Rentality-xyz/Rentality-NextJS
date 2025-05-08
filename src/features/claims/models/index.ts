import { ClaimStatus, ClaimType } from "@/model/blockchain/schemas";
import { UserCurrencyDTO } from "@/model/SearchCarsResult";

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
  amountInUsdCents: number;
  amountInEth: bigint;
  payDateInSec: number;
  rejectedBy: string;
  rejectedDateInSec: number;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
  isIncomingClaim: boolean;
  fileUrls: string[];
  timeZoneId: string;
  currency: UserCurrencyDTO;
};

export enum ClaimTypeEnum {
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
    case ClaimType.FaultyVehicle:
      return "The vehicle is not working";
    case ClaimType.ListingMismatch:
      return "Vehicle does not match listing";
    case ClaimType.Other:
    default:
      return "Other";
  }
};

export enum ClaimStatusEnum {
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
