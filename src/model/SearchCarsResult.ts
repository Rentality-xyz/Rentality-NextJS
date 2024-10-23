import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { emptyLocationInfo } from "./LocationInfo";
import { DEFAULT_SEARCH_DATE_FROM, DEFAULT_SEARCH_DATE_TO } from "@/utils/constants";
import { EngineType } from "./blockchain/schemas";
import { TransmissionType } from "./Transmission";
import { TripDiscountsFormValues } from "@/components/host/tripDiscountsFormSchema";

export type SearchCarsResult = {
  searchCarRequest: SearchCarRequest;
  searchCarFilters: SearchCarFilters;
  carInfos: SearchCarInfo[];
};

export type DeliveryDetails = {
  pickUp: { distanceInMiles: number; priceInUsd: number };
  dropOff: { distanceInMiles: number; priceInUsd: number };
};

export type SearchCarInfo = {
  carId: number;
  ownerAddress: string;
  images: string[];
  brand: string;
  model: string;
  year: string;

  carName: string;
  seatsNumber: number;
  doorsNumber: number;
  engineType: EngineType;
  transmission: TransmissionType;
  tankSizeInGal: number;
  color: string;
  carDescription: string;

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
  deliveryDetails: DeliveryDetails;
  isCarDetailsConfirmed: boolean;
  isTestCar: boolean;
  isInsuranceRequired: boolean;
  insurancePerDayPriceInUsd: number;
};

export type SearchCarInfoDTO = Omit<SearchCarInfo, "engineType"> & { engineType: number };

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
