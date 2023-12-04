import { isEmpty } from "@/utils/string";

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
  fuelType: string;
  tankVolumeInGal: string;
  wheelDrive: string;
  transmission: string;
  trunkSize: string;
  color: string;
  bodyType: string;
  description: string;
  pricePerDay: string;
  milesIncludedPerDay: string;
  securityDeposit: string;
  fuelPricePerGal: string;
  country: string;
  state: string;
  city: string;
  locationLatitude: string;
  locationLongitude: string;
  currentlyListed: boolean;
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
    !isEmpty(carInfoFormParams.fuelType) &&
    !isEmpty(carInfoFormParams.tankVolumeInGal) &&
    //!carInfoFormParams.wheelDrive &&
    !isEmpty(carInfoFormParams.transmission) &&
    //!carInfoFormParams.trunkSize &&
    !isEmpty(carInfoFormParams.color) &&
    //!isEmpty(carInfoFormParams.bodyType) &&
    !isEmpty(carInfoFormParams.description) &&
    !isEmpty(carInfoFormParams.pricePerDay) &&
    !isEmpty(carInfoFormParams.milesIncludedPerDay) &&
    !isEmpty(carInfoFormParams.securityDeposit) &&
    !isEmpty(carInfoFormParams.fuelPricePerGal) &&
    !isEmpty(carInfoFormParams.country) &&
    !isEmpty(carInfoFormParams.state) &&
    !isEmpty(carInfoFormParams.city) &&
    !isEmpty(carInfoFormParams.locationLatitude) &&
    !isEmpty(carInfoFormParams.locationLongitude)
  );
};
