export type SearchCarRequest = {
  searchLocation: {
    address: string;
    country: string;
    state: string;
    city: string;
    locationLat: number | undefined;
    locationLng: number | undefined;
  };
  dateFrom: string;
  dateTo: string;
  searchFilters: {
    brand: string;
    model: string;
    yearOfProductionFrom: string;
    yearOfProductionTo: string;
    pricePerDayInUsdFrom: string;
    pricePerDayInUsdTo: string;
  };
};

export const emptySearchCarRequest: SearchCarRequest = {
  searchLocation: {
    country: "",
    state: "",
    city: "",
    locationLat: 0,
    locationLng: 0,
    address: "",
  },
  dateFrom: "",
  dateTo: "",
  searchFilters: {
    brand: "",
    model: "",
    yearOfProductionFrom: "",
    yearOfProductionTo: "",
    pricePerDayInUsdFrom: "",
    pricePerDayInUsdTo: "",
  },
};
