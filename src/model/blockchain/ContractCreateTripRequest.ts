export type ContractCreateTripRequest = {
  carId: bigint;
  host: string;
  startDateTime: bigint;
  endDateTime: bigint;
  startLocation: string;
  endLocation: string;
  totalDayPriceInUsdCents: number;
  taxPriceInUsdCents: number;
  depositInUsdCents: number;
  fuelPrices: BigInt[];
  ethToCurrencyRate: bigint;
  ethToCurrencyDecimals: number;
};
