export type ContractCreateTripRequest = {
  carId: number;
  host: string;
  startDateTime: number;
  endDateTime: number;
  startLocation: string;
  endLocation: string;
  totalDayPriceInUsdCents: number;
  taxPriceInUsdCents: number;
  depositInUsdCents: number;
  ethToCurrencyRate: number;
  ethToCurrencyDecimals: number;
};