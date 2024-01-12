import { validateType } from "@/utils/typeValidator";

export const ENGINE_TYPE_PATROL_STRING = "Gasoline";
export const ENGINE_TYPE_ELECTRIC_STRING = "Electro";

enum EngineType {
  PATROL,
  ELECTRIC,
}

export type ContractCarInfo = {
  carId: bigint;
  carVinNumber: string;
  createdBy: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineType: EngineType;
  engineParams: bigint[];
  milesIncludedPerDay: bigint;
  currentlyListed: boolean;
  geoVerified: boolean;
};

const emptyContractCarInfo: ContractCarInfo = {
  carId: BigInt(0),
  carVinNumber: "",
  createdBy: "",
  brand: "",
  model: "",
  yearOfProduction: 0,
  pricePerDayInUsdCents: BigInt(0),
  securityDepositPerTripInUsdCents: BigInt(0),
  engineType: EngineType.ELECTRIC,
  engineParams: [],
  milesIncludedPerDay: BigInt(0),
  currentlyListed: false,
  geoVerified: false,
};

export function validateContractCarInfo(obj: ContractCarInfo): obj is ContractCarInfo {
  return validateType(obj, emptyContractCarInfo);
}

export type ContractAvailableCarInfo = {
  car: ContractCarInfo;
  hostPhotoUrl: string;
  hostName: string;
};

export function validateContractAvailableCarInfo(obj: ContractAvailableCarInfo): obj is ContractAvailableCarInfo {
  if (typeof obj !== "object" || obj == null) return false;
  const emptyContractAvailableCarInfo: ContractAvailableCarInfo = {
    car: emptyContractCarInfo,
    hostName: "",
    hostPhotoUrl: "",
  };

  return validateType(obj, emptyContractAvailableCarInfo);
}

export function getEngineTypeString(engineType: EngineType): string {
  switch (engineType) {
    case EngineType.PATROL:
      return ENGINE_TYPE_PATROL_STRING;
    case EngineType.ELECTRIC:
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
