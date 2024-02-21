import { isEmpty } from "@/utils/string";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PATROL_STRING } from "./blockchain/ContractCarInfo";

export const UNLIMITED_MILES_VALUE_TEXT = "Unlimited";
export const UNLIMITED_MILES_VALUE = 999_999_999;

export const getMilesIncludedPerDayText = (value: bigint | number) => {
  if (value === 0 || value >= UNLIMITED_MILES_VALUE) return UNLIMITED_MILES_VALUE_TEXT;
  return value.toString();
};

export type HostCarInfo = {
  carId: number;
  ownerAddress: string;
  image: string;
  vinNumber: string;
  brand: string;
  model: string;
  releaseYear: string;
  name: string;
  licensePlate: string;
  licenseState: string;
  seatsNumber: string;
  doorsNumber: string;
  transmission: string;
  color: string;
  description: string;
  pricePerDay: string;
  milesIncludedPerDay: string;
  securityDeposit: string;
  timeBufferBetweenTripsInMin: number;
  currentlyListed: boolean;

  locationAddress: string;
  isLocationAddressEdited: boolean;
  country: string;
  state: string;
  city: string;
  locationLatitude: string;
  locationLongitude: string;

  engineTypeString: string;

  fuelPricePerGal: string;
  tankVolumeInGal: string;

  fullBatteryChargePrice: string;

  wheelDrive: string;
  bodyType: string;
  trunkSize: string;
};

export const verifyCar = (carInfoFormParams: HostCarInfo) => {
  return (
    !isEmpty(carInfoFormParams.vinNumber) &&
    !isEmpty(carInfoFormParams.brand) &&
    !isEmpty(carInfoFormParams.model) &&
    !isEmpty(carInfoFormParams.releaseYear) &&
    !isEmpty(carInfoFormParams.name) &&
    !isEmpty(carInfoFormParams.licensePlate) &&
    !isEmpty(carInfoFormParams.licenseState) &&
    !isEmpty(carInfoFormParams.seatsNumber) &&
    !isEmpty(carInfoFormParams.doorsNumber) &&
    !isEmpty(carInfoFormParams.transmission) &&
    !isEmpty(carInfoFormParams.color) &&
    !isEmpty(carInfoFormParams.description) &&
    !isEmpty(carInfoFormParams.pricePerDay) &&
    !isEmpty(carInfoFormParams.milesIncludedPerDay) &&
    !isEmpty(carInfoFormParams.securityDeposit) &&
    !isEmpty(carInfoFormParams.locationAddress) &&
    !isEmpty(carInfoFormParams.engineTypeString) &&
    (carInfoFormParams.engineTypeString !== ENGINE_TYPE_PATROL_STRING || !isEmpty(carInfoFormParams.fuelPricePerGal)) &&
    (carInfoFormParams.engineTypeString !== ENGINE_TYPE_PATROL_STRING || !isEmpty(carInfoFormParams.tankVolumeInGal)) &&
    (carInfoFormParams.engineTypeString !== ENGINE_TYPE_ELECTRIC_STRING ||
      !isEmpty(carInfoFormParams.fullBatteryChargePrice))
  );
};
