export type ContractSearchCarParams = {
  country: string;
  state: string;
  city: string;
  brand: string;
  model: string;
  yearOfProductionFrom: bigint;
  yearOfProductionTo: bigint;
  pricePerDayInUsdCentsFrom: bigint;
  pricePerDayInUsdCentsTo: bigint;
};
