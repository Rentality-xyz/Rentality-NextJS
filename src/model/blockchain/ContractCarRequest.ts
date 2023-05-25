export type ContractCarRequest = {
  carId: bigint;
  host: string;
  startDateTime: number;
  endDateTime: number;
  startLocation: string;
  endLocation: string;
  totalDayPriceInUsdCents: number;
  taxPriceInUsdCents: number;
  depositInUsdCents: number;
  ethToCurrencyRate: bigint;
  ethToCurrencyDecimals: number;
};