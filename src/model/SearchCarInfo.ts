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
  distanceIncludedInMi: string;
  pricePerDay: number;
  fuelPricePerGalInUsdCents: number;
  location: string;
  dateFrom: Date;
  dateTo: Date;
  days: number;
  totalPrice: number;
};