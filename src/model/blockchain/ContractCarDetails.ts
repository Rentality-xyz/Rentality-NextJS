import { validateType } from "@/utils/typeValidator";
import { EngineType } from "../EngineType";

export type ContractCarDetails = {
  carId: bigint;
  hostName: string;
  hostPhotoUrl: string;
  host: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  milesIncludedPerDay: bigint;
  engineType: EngineType;
  engineParams: bigint[];
  geoVerified: boolean;
  timeZoneId: string;
  city: string;
  country: string;
  state: string;
  locationLatitude: string;
  locationLongitude: string;
};

export const emptyContractCarDetails: ContractCarDetails = {
  carId: BigInt(0),
  hostName: "",
  hostPhotoUrl: "",
  host: "",
  brand: "",
  model: "",
  yearOfProduction: 0,
  pricePerDayInUsdCents: BigInt(0),
  securityDepositPerTripInUsdCents: BigInt(0),
  milesIncludedPerDay: BigInt(0),
  engineType: EngineType.PATROL,
  engineParams: [],
  geoVerified: false,
  timeZoneId: "",
  city: "",
  country: "",
  state: "",
  locationLatitude: "",
  locationLongitude: "",
};

export function validateContractCarDetails(obj: ContractCarDetails): obj is ContractCarDetails {
  return validateType(obj, emptyContractCarDetails);
}
