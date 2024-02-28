import { validateType } from "@/utils/typeValidator";
import { EngineType } from "../EngineType";

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
  timeBufferBetweenTripsInSec: number;
  currentlyListed: boolean;
  geoVerified: boolean;
  timeZoneId: string;
  isEditable: boolean;
};

export const emptyContractCarInfo: ContractCarInfo = {
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
  timeBufferBetweenTripsInSec: 0,
  timeZoneId: "",
  isEditable: false,
};

export function validateContractCarInfo(obj: ContractCarInfo): obj is ContractCarInfo {
  return validateType(obj, emptyContractCarInfo);
}
