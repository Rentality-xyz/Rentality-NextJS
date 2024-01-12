export type ContractCreateCarRequest = {
  tokenUri: string;
  carVinNumber: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineParams: bigint[];
  engineType: number;
  milesIncludedPerDay: bigint;
  timeBufferBetweenTripsInSec: number;
  locationAddress: string;
  geoApiKey: string;
};
