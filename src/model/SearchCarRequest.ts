import { LocationInfo } from "./LocationInfo";

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
  isDeliveryToGuest: boolean;
  deliveryInfo: {
    pickupLocation: { isHostHomeLocation: true } | { isHostHomeLocation: false; locationInfo: LocationInfo };
    returnLocation: { isHostHomeLocation: true } | { isHostHomeLocation: false; locationInfo: LocationInfo };
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
  isDeliveryToGuest: false,
  deliveryInfo: {
    pickupLocation: { isHostHomeLocation: true },
    returnLocation: { isHostHomeLocation: true },
  },
};
