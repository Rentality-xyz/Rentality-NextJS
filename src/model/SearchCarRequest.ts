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
    pickupLocation:
      | { isHostHomeLocatiom: true }
      | { isHostHomeLocatiom: false; address: string; lat: number; lng: number };
    returnLocation:
      | { isHostHomeLocatiom: true }
      | { isHostHomeLocatiom: false; address: string; lat: number; lng: number };
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
    pickupLocation: { isHostHomeLocatiom: true },
    returnLocation: { isHostHomeLocatiom: true },
  },
};
