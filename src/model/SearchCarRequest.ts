export type SearchCarRequest = {
  dateFrom: string;
  dateTo: string;
  country: string;
  state: string;
  city: string;
  brand: string;
  model: string;
  yearOfProductionFrom: string;
  yearOfProductionTo: string;
  pricePerDayInUsdFrom: string;
  pricePerDayInUsdTo: string;
  locationLat: number | undefined;
  locationLng: number | undefined;
};

export const emptySearchCarRequest: SearchCarRequest = {
  dateFrom: "",
  dateTo: "",
  country: "",
  state: "",
  city: "",
  brand: "",
  model: "",
  yearOfProductionFrom: "",
  yearOfProductionTo: "",
  pricePerDayInUsdFrom: "",
  pricePerDayInUsdTo: "",
  locationLat: 0,
  locationLng: 0,
};
