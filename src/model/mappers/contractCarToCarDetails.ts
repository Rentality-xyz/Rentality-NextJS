import { parseMetaData } from "@/features/filestore/utils";
import { getFileURI, getMetaData } from "@/features/filestore";
import { ContractCarDetails, ContractCarInfo, ContractInsuranceCarInfo } from "../blockchain/schemas";
import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE_TEXT } from "../HostCarInfo";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeString } from "../EngineType";

export const mapContractCarToCarDetails = async (
  carInfo: ContractCarInfo,
  insuranceInfo: ContractInsuranceCarInfo,
  carInfoDetails: ContractCarDetails,
  tokenURI: string
): Promise<HostCarInfo> => {
  const metaData = parseMetaData(await getMetaData(tokenURI));

  const price = Number(carInfo.pricePerDayInUsdCents) / 100;
  const securityDeposit = Number(carInfo.securityDepositPerTripInUsdCents) / 100;
  const engineTypeString = getEngineTypeString(carInfo.engineType);

  const tankVolumeInGal = engineTypeString === ENGINE_TYPE_PETROL_STRING ? Number(carInfo.engineParams[0]) : 0;
  const fuelPricePerGal = engineTypeString === ENGINE_TYPE_PETROL_STRING ? Number(carInfo.engineParams[1]) / 100 : 0;
  const fullBatteryChargePrice =
    engineTypeString === ENGINE_TYPE_ELECTRIC_STRING ? Number(carInfo.engineParams[0]) / 100 : 0;

  return {
    carId: Number(carInfo.carId),
    ownerAddress: carInfo.createdBy.toString(),
    images: metaData.images.map((image, index) => ({ url: getFileURI(image), isPrimary: index === 0 })),
    vinNumber: carInfo.carVinNumber,
    brand: carInfo.brand,
    model: carInfo.model,
    releaseYear: Number(carInfo.yearOfProduction),
    name: metaData.name,
    licensePlate: metaData.licensePlate,
    licenseState: metaData.licenseState,
    seatsNumber: metaData.seatsNumber,
    doorsNumber: metaData.doorsNumber,
    tankVolumeInGal: tankVolumeInGal,
    wheelDrive: metaData.wheelDrive,
    transmission: metaData.transmission,
    trunkSize: metaData.trunkSize,
    color: metaData.color,
    bodyType: metaData.bodyType,
    description: metaData.description,
    pricePerDay: price,
    milesIncludedPerDay: isUnlimitedMiles(carInfo.milesIncludedPerDay)
      ? UNLIMITED_MILES_VALUE_TEXT
      : Number(carInfo.milesIncludedPerDay),
    securityDeposit: securityDeposit,
    locationInfo: {
      address: carInfoDetails.locationInfo.userAddress,
      country: carInfoDetails.locationInfo.country,
      state: carInfoDetails.locationInfo.state,
      city: carInfoDetails.locationInfo.city,
      latitude: Number(carInfoDetails.locationInfo.latitude),
      longitude: Number(carInfoDetails.locationInfo.longitude),
      timeZoneId: carInfoDetails.locationInfo.timeZoneId,
    },
    isLocationEdited: false,
    currentlyListed: carInfo.currentlyListed,
    engineTypeText: engineTypeString ?? ENGINE_TYPE_PETROL_STRING,
    fuelPricePerGal: fuelPricePerGal,
    fullBatteryChargePrice: fullBatteryChargePrice,
    timeBufferBetweenTripsInMin: Number(carInfo.timeBufferBetweenTripsInSec) / 60,
    isGuestInsuranceRequired: insuranceInfo.required,
    insurancePerDayPriceInUsd: Number(insuranceInfo.priceInUsdCents) / 100,
    isCarMetadataEdited: false,
    metadataUrl: tokenURI,
    dimoTokenId: Number(carInfoDetails.dimoTokenId),
    insurancePriceInUsdCents: Number(insuranceInfo.priceInUsdCents),
  };
};
