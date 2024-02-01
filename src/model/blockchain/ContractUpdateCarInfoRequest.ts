export type ContractUpdateCarInfoRequest = {
  carId: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineParams: bigint[];
  milesIncludedPerDay: bigint;
  timeBufferBetweenTripsInSec: number;
  currentlyListed: boolean;
};
