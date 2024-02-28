import { validateType } from "@/utils/typeValidator";
import { EngineType } from "../EngineType";

export type ContractSearchCar = {
  carId: bigint;
  brand: string;
  model: string;
  yearOfProduction: number;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineType: EngineType;
  milesIncludedPerDay: bigint;
  host: string;
  hostName: string;
  hostPhotoUrl: string;
  city: string;
  country: string;
  state: string;
  locationLatitude: string;
  locationLongitude: string;
  timeZoneId: string;
};

export const emptyContractSearchCar: ContractSearchCar = {
  carId: BigInt(0),
  brand: "",
  model: "",
  yearOfProduction: 0,
  pricePerDayInUsdCents: BigInt(0),
  securityDepositPerTripInUsdCents: BigInt(0),
  engineType: EngineType.PATROL,
  milesIncludedPerDay: BigInt(0),
  host: "",
  hostName: "",
  hostPhotoUrl: "",
  city: "",
  country: "",
  state: "",
  locationLatitude: "",
  locationLongitude: "",
  timeZoneId: "",
};

export function validateContractSearchCar(obj: ContractSearchCar): obj is ContractSearchCar {
  return validateType(obj, emptyContractSearchCar);
}
