export type ContractCarInfo = {
  carId: bigint;
  carVinNumber: string;
  createdBy: string;
  brand: string;
  model: string;
  yearOfProduction: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineType: bigint;
  engineParams: bigint[];
  milesIncludedPerDay: bigint;
  currentlyListed: boolean;
  geoVerified: boolean;
};

export function validateContractCarInfo(obj: ContractCarInfo): obj is ContractCarInfo {
  if (typeof obj !== "object" || obj == null) return false;

  if (obj.carId === undefined) {
    console.error("obj does not contain property carId");
    return false;
  }
  if (obj.createdBy === undefined) {
    console.error("obj does not contain property createdBy");
    return false;
  }
  if (obj.pricePerDayInUsdCents === undefined) {
    console.error("obj does not contain property pricePerDayInUsdCents");
    return false;
  }
  if (obj.currentlyListed === undefined) {
    console.error("obj does not contain property currentlyListed");
    return false;
  }
  return true;
}

export const ENGINE_TYPE_PATROL_STRING = "Gasoline";
export const ENGINE_TYPE_ELECTRIC_STRING = "Electro";

export function getEngineTypeString(engineType: bigint): string {
  switch (Number(engineType)) {
    case 1:
      return ENGINE_TYPE_PATROL_STRING;
    case 2:
      return ENGINE_TYPE_ELECTRIC_STRING;
    default:
      return "";
  }
}

export function getEngineTypeCode(engineTypeString: string): bigint {
  switch (engineTypeString) {
    case ENGINE_TYPE_PATROL_STRING:
      return BigInt(1);
    case ENGINE_TYPE_ELECTRIC_STRING:
      return BigInt(2);
    default:
      return BigInt(0);
  }
}

export type ContractAvailableCarInfo = {
  car: ContractCarInfo;
  hostPhotoUrl: string;
  hostName: string;
};

export function validateContractAvailableCarInfo(obj: ContractAvailableCarInfo): obj is ContractAvailableCarInfo {
  if (typeof obj !== "object" || obj == null) return false;

  if (obj.car.carId === undefined) {
    console.error("obj does not contain property carId");
    return false;
  }
  if (obj.car.createdBy === undefined) {
    console.error("obj does not contain property createdBy");
    return false;
  }
  if (obj.car.pricePerDayInUsdCents === undefined) {
    console.error("obj does not contain property pricePerDayInUsdCents");
    return false;
  }
  if (obj.car.currentlyListed === undefined) {
    console.error("obj does not contain property currentlyListed");
    return false;
  }
  return true;
}
