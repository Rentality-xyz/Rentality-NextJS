import { LocationInfo, emptyLocationInfo } from "./LocationInfo";

export type SearchCarRequest = {
  searchLocation: LocationInfo;
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
  searchLocation: emptyLocationInfo,
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
  isDeliveryToGuest: true,
  deliveryInfo: {
    pickupLocation: { isHostHomeLocation: true },
    returnLocation: { isHostHomeLocation: true },
  },
};
