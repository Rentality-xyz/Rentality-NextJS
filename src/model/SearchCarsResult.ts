import { emptySearchCarRequest, SearchCarRequest } from "./SearchCarRequest";

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
  licensePlate: string;
  seatsNumber: string;
  transmission: string;
  engineType: string;
  milesIncludedPerDay: string;
  pricePerDay: number;
  days: number;
  totalPrice: number;
  securityDeposit: number;
  hostPhotoUrl: string;
  hostName: string;
  fuelPricesInUsdCents: number[];
};

export const emptySearchCarsResult: SearchCarsResult = {
  searchCarRequest: emptySearchCarRequest,
  carInfos: [],
};
