export type ContractSearchCarParams = {
  country: string;
  state: string;
  city: string;
  brand: string;
  model: string;
  yearOfProductionFrom: number;
  yearOfProductionTo: number;
  pricePerDayInUsdCentsFrom: bigint;
  pricePerDayInUsdCentsTo: bigint;
};
