export type TripDetails = {  
  tripId: bigint;
  carId: bigint;
  status: string; //TripStatus
  guest: string;
  host: string;
  startDateTime: Date;
  endDateTime: Date;
  startLocation: string;
  endLocation: string;
  milesIncluded: number;
  fuelPricePerGalInUsd: number;
  approvedDateTime: Date | undefined;
  checkedInByHostDateTime: Date | undefined;
  startFuelLevel: number | undefined;
  startOdometr: number | undefined;
  checkedInByGuestDateTime: Date | undefined;
  checkedOutByGuestDateTime: Date | undefined;
  endFuelLevel: number | undefined;
  endOdometr: number | undefined;
  checkedOutByHostDateTime: Date | undefined;
  resolveAmountInUsd: number | undefined;
  
  paymentFrom: string;
  paymentTo: string;
  totalDayPriceInUsd: number;
  taxPriceInUsd: number;
  depositInUsd: number;
  currencyType: number;
  ethToCurrencyRate: number;
};