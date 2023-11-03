export type ContractCreateTripRequest = {
  carId: bigint;
  host: string;
  startDateTime: number;
  endDateTime: number;
  startLocation: string;
  endLocation: string;
  totalDayPriceInUsdCents: number;
  taxPriceInUsdCents: number;
  depositInUsdCents: number;
  fuelPricePerGalInUsdCents: number;
  ethToCurrencyRate: bigint;
  ethToCurrencyDecimals: number;
};
