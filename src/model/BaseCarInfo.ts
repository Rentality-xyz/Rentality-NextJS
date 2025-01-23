import { TFunction } from "@/utils/i18n";

export type BaseCarInfo = {
  carId: number;
  ownerAddress: string;
  image: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  pricePerDay: number;
  securityDeposit: number;
  milesIncludedPerDay: number;
  currentlyListed: boolean;
  isEditable: boolean;
  vinNumber: string;
  dimoTokenId: number;
};

export const getListingStatusTextFromStatus = (currentlyListed: boolean, t: TFunction) => {
  return currentlyListed ? t("vehicles.listed") : t("vehicles.unlisted");
};
