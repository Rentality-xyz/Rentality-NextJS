import { isEmpty } from "@/utils/string";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING } from "./EngineType";
import { emptyLocationInfo, LocationInfo } from "./LocationInfo";
import { TRANSMISSION_MANUAL_STRING, TransmissionType } from "./Transmission";
import { PlatformCarImage } from "./FileToUpload";

export const UNLIMITED_MILES_VALUE_TEXT = "Unlimited";
export const UNLIMITED_MILES_VALUE = 999_999_999;

export type HostCarInfo = {
  carId: number;
  ownerAddress: string;
  images: PlatformCarImage[];
  vinNumber: string;
  brand: string;
  model: string;
  releaseYear: number;
  name: string;
  licensePlate: string;
  licenseState: string;
  seatsNumber: number;
  doorsNumber: number;
  transmission: TransmissionType;
  color: string;
  description: string;
  pricePerDay: number;
  milesIncludedPerDay: number | typeof UNLIMITED_MILES_VALUE_TEXT;
  securityDeposit: number;
  timeBufferBetweenTripsInMin: number;
  currentlyListed: boolean;

  isLocationEdited: boolean;
  locationInfo: LocationInfo;

  engineTypeText: typeof ENGINE_TYPE_PETROL_STRING | typeof ENGINE_TYPE_ELECTRIC_STRING;

  fuelPricePerGal: number;
  tankVolumeInGal: number;

  fullBatteryChargePrice: number;

  wheelDrive: string;
  bodyType: string;
  trunkSize: string;
  isGuestInsuranceRequired: boolean;
  insurancePerDayPriceInUsd: number;
  isCarMetadataEdited: boolean;

  metadataUrl: string;
};

export const emptyHostCarInfo: HostCarInfo = {
  carId: 0,
  ownerAddress: "",
  vinNumber: "",
  brand: "",
  model: "",
  releaseYear: 0,
  images: [],
  name: "",
  licensePlate: "",
  licenseState: "",
  seatsNumber: 0,
  doorsNumber: 0,
  tankVolumeInGal: 0,
  wheelDrive: "",
  transmission: TRANSMISSION_MANUAL_STRING,
  trunkSize: "",
  color: "",
  bodyType: "",
  description: "",
  pricePerDay: 0,
  milesIncludedPerDay: 0,
  securityDeposit: 0,
  fuelPricePerGal: 0,
  locationInfo: emptyLocationInfo,
  isLocationEdited: true,
  currentlyListed: true,
  engineTypeText: ENGINE_TYPE_PETROL_STRING,
  fullBatteryChargePrice: 0,
  timeBufferBetweenTripsInMin: 0,
  isGuestInsuranceRequired: false,
  insurancePerDayPriceInUsd: 0,
  isCarMetadataEdited: false,
  metadataUrl: "",
};

export const verifyCar = (carInfoFormParams: HostCarInfo) => {
  return (
    !isEmpty(carInfoFormParams.vinNumber) &&
    !isEmpty(carInfoFormParams.brand) &&
    !isEmpty(carInfoFormParams.model) &&
    carInfoFormParams.releaseYear > 0 &&
    !isEmpty(carInfoFormParams.name) &&
    !isEmpty(carInfoFormParams.licensePlate) &&
    !isEmpty(carInfoFormParams.licenseState) &&
    carInfoFormParams.seatsNumber > 0 &&
    carInfoFormParams.doorsNumber > 0 &&
    !isEmpty(carInfoFormParams.transmission) &&
    !isEmpty(carInfoFormParams.color) &&
    !isEmpty(carInfoFormParams.description) &&
    carInfoFormParams.pricePerDay > 0 &&
    (carInfoFormParams.milesIncludedPerDay === UNLIMITED_MILES_VALUE_TEXT ||
      carInfoFormParams.milesIncludedPerDay > 0) &&
    carInfoFormParams.securityDeposit > 0 &&
    !isEmpty(carInfoFormParams.locationInfo.address) &&
    !isEmpty(carInfoFormParams.engineTypeText) &&
    (carInfoFormParams.engineTypeText !== ENGINE_TYPE_PETROL_STRING || carInfoFormParams.fuelPricePerGal > 0) &&
    (carInfoFormParams.engineTypeText !== ENGINE_TYPE_PETROL_STRING || carInfoFormParams.tankVolumeInGal > 0) &&
    (carInfoFormParams.engineTypeText !== ENGINE_TYPE_ELECTRIC_STRING || carInfoFormParams.fullBatteryChargePrice > 0)
  );
};

export const isUnlimitedMiles = (value: bigint | number | typeof UNLIMITED_MILES_VALUE_TEXT) => {
  return value === 0 || value === UNLIMITED_MILES_VALUE_TEXT || value >= UNLIMITED_MILES_VALUE;
};

export const getMilesIncludedPerDayText = (value: bigint | number) => {
  return isUnlimitedMiles(value) ? UNLIMITED_MILES_VALUE_TEXT : value.toString();
};
