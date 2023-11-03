export type ContractCreateCarRequest = {
  tokenUri: string;
  carVinNumber: string;
  brand: string;
  model: string;
  yearOfProduction: string;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  tankVolumeInGal: bigint;
  fuelPricePerGalInUsdCents: bigint;
  milesIncludedPerDay: bigint;
  country: string;
  state: string;
  city: string;
  locationLatitudeInPPM: bigint;
  locationLongitudeInPPM: bigint;
};
