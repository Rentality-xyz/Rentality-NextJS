import { Root } from "react-dom/client";
import { emptySearchCarRequest, SearchCarRequest } from "./SearchCarRequest";

type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

export type SearchCarsResult = {
  searchCarRequest: SearchCarRequest;
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
};

export const emptySearchCarsResult: SearchCarsResult = {
  searchCarRequest: emptySearchCarRequest,
  carInfos: [],
};
