import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { emptyLocationInfo } from "./LocationInfo";
import { DEFAULT_SEARCH_DATE_FROM, DEFAULT_SEARCH_DATE_TO } from "@/utils/constants";

export type SearchCarsResult = {
  searchCarRequest: SearchCarRequest;
  searchCarFilters: SearchCarFilters;
  carInfos: SearchCarInfo[];
};

export type SearchCarInfo = {
  carId: number;
  ownerAddress: string;
  image: string;
  brand: string;
  model: string;
  year: string;
  seatsNumber: string;
  transmission: string;
  engineTypeText: string;
  milesIncludedPerDay: string;
  pricePerDay: number;
  pricePerDayWithDiscount: number;
  tripDays: number;
  totalPriceWithDiscount: number;
  taxes: number;
  securityDeposit: number;
  hostPhotoUrl: string;
  hostName: string;
  timeZoneId: string;
  location: {
    lat: number;
    lng: number;
  };
  highlighted: boolean;
  daysDiscount: string;
  totalDiscount: string;
  hostHomeLocation: string;
  isInsuranceIncluded: boolean;
  deliveryPrices: {
    from1To25milesPrice: number;
    over25MilesPrice: number;
  };
  pickUpDeliveryFee: number;
  dropOffDeliveryFee: number;
  isCarDetailsConfirmed: boolean;
  isTestCar: boolean;
  insuranceRequired: boolean;
  insurancePerDayPriceInUsd: number;
};

const emptySearchCarRequest: SearchCarRequest = {
  searchLocation: emptyLocationInfo,
  dateFrom: DEFAULT_SEARCH_DATE_FROM,
  dateTo: DEFAULT_SEARCH_DATE_TO,
  isDeliveryToGuest: false,
  deliveryInfo: {
    pickupLocation: { isHostHomeLocation: true },
    returnLocation: { isHostHomeLocation: true },
  },
};

export const emptySearchCarsResult: SearchCarsResult = {
  searchCarRequest: emptySearchCarRequest,
  searchCarFilters: {},
  carInfos: [],
};
