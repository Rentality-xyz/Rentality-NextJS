export type SearchCarRequest = {
  dateFrom: string;
  dateTo: string;
  country: string;
  state: string;
  city: string;
  utcOffsetMinutes: number;
  brand: string;
  model: string;
  yearOfProductionFrom: string;
  yearOfProductionTo: string;
  pricePerDayInUsdFrom: string;
  pricePerDayInUsdTo: string;
};

export const emptySearchCarRequest: SearchCarRequest = {
  dateFrom: "",
  dateTo: "",
  country: "",
  state: "",
  city: "",
  utcOffsetMinutes: 0,
  brand: "",
  model: "",
  yearOfProductionFrom: "",
  yearOfProductionTo: "",
  pricePerDayInUsdFrom: "",
  pricePerDayInUsdTo: "",
};
