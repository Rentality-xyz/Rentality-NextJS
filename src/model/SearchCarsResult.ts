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
  fuelType: string;
  milesIncludedPerDay: string;
  pricePerDay: number;
  fuelPricePerGal: number;
  days: number;
  totalPrice: number;
  securityDeposit: number;
};

export const emptySearchCarsResult: SearchCarsResult = {
  searchCarRequest: emptySearchCarRequest,
  carInfos: [],
};
