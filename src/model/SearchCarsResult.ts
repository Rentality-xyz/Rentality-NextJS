import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { emptyLocationInfo } from "./LocationInfo";
import { DEFAULT_SEARCH_DATE_FROM, DEFAULT_SEARCH_DATE_TO } from "@/utils/constants";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import { EngineType } from "./blockchain/schemas";
import { TransmissionType } from "./Transmission";
import { TripDiscountsFormValues } from "@/components/host/tripDiscountsFormSchema";

export type FilterLimits = {
  minCarYear: number;
  maxCarPrice: number;
};

export type SearchCarsResult = {
  searchCarRequest: SearchCarRequest;
  searchCarFilters: SearchCarFilters;
  carInfos: SearchCarInfo[];
  filterLimits: FilterLimits;
};

export type DeliveryDetails = {
  pickUp: { distanceInMiles: number; priceInUsd: number };
  dropOff: { distanceInMiles: number; priceInUsd: number };
};

export type UserCurrencyDTO = {
  currency: string;
  name: string;
  initialized: boolean;
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

  milesIncludedPerDayText: string;
  pricePerDay: number;
  pricePerDayWithHostDiscount: number;
  tripDays: number;
  totalPriceWithHostDiscount: number;
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
  isGuestHasInsurance: boolean;
  distanceToUser: number;
  dimoTokenId: number;
  currency: UserCurrencyDTO;
  priceInCurrency: number;
};

export type SearchCarInfoDTO = Omit<SearchCarInfo, "engineType"> & { engineType: number };

export type SearchCarInfoDetails = SearchCarInfo & {
  pricePer10PercentFuel: number;
  tripDiscounts: TripDiscountsFormValues;
  salesTax: number;
  governmentTax: number;
};

const emptySearchCarRequest: SearchCarRequest = {
  searchLocation: emptyLocationInfo,
  dateFromInDateTimeStringFormat: dateToHtmlDateTimeFormat(DEFAULT_SEARCH_DATE_FROM),
  dateToInDateTimeStringFormat: dateToHtmlDateTimeFormat(DEFAULT_SEARCH_DATE_TO),
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
  filterLimits: { minCarYear: Number.NEGATIVE_INFINITY, maxCarPrice: Number.POSITIVE_INFINITY },
};
