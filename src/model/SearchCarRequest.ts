import { LocationInfo } from "./LocationInfo";

export type SearchCarFilters = {
  brand?: string;
  model?: string;
  yearOfProductionFrom?: number;
  yearOfProductionTo?: number;
  pricePerDayInUsdFrom?: number;
  pricePerDayInUsdTo?: number;
  carId?: number;
};

export type SearchCarRequest = {
  searchLocation: LocationInfo;
  dateFrom: Date;
  dateTo: Date;
  isDeliveryToGuest: boolean;
  deliveryInfo: {
    pickupLocation: { isHostHomeLocation: true } | { isHostHomeLocation: false; locationInfo: LocationInfo };
    returnLocation: { isHostHomeLocation: true } | { isHostHomeLocation: false; locationInfo: LocationInfo };
  };
};
