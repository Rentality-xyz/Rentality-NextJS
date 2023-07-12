import { TripStatus } from "../TripInfo";

export type ContractTrip = {
  tripId: bigint;
  carId: bigint;
  status: number; //TripStatus
  guest: string;
  host: string;
  pricePerDayInUsdCents: bigint;
  startDateTime: bigint;
  endDateTime: bigint;
  startLocation: string;
  endLocation: string;
  milesIncludedPerDay: number;
  fuelPricePerGalInUsdCents: bigint;
  paymentInfo: PaymentInfo;
  approvedDateTime: bigint;
  checkedInByHostDateTime: bigint;
  startFuelLevelInGal: bigint;
  startOdometr: bigint;
  checkedInByGuestDateTime: bigint;
  checkedOutByGuestDateTime: bigint;
  endFuelLevelInGal: bigint;
  endOdometr: bigint;
  checkedOutByHostDateTime: bigint;
};

type PaymentInfo = {
  tripId: bigint;
  from: string;
  to: string;
  totalDayPriceInUsdCents: bigint;
  taxPriceInUsdCents: bigint;
  depositInUsdCents: bigint;
  resolveAmountInUsdCents: bigint;
  currencyType: number;
  ethToCurrencyRate: bigint;
  ethToCurrencyDecimals: bigint;
};

export const getTripStatusFromContract = (status: number) => {
  switch (status) {
    case 0:
      return TripStatus.Pending;
    case 1:
      return TripStatus.Confirmed;
    case 2:
      return TripStatus.CheckedInByHost;
    case 3:
      return TripStatus.Started;
    case 4:
      return TripStatus.CheckedOutByGuest;
    case 5:
      return TripStatus.Finished;
    case 6:
      return TripStatus.Closed;
    case 7:
    default:
      return TripStatus.Rejected;
  }
};

export function validateContractTrip(obj: ContractTrip): obj is ContractTrip {
  if (typeof obj !== "object" || obj == null) return false;

  if (obj.carId === undefined) {
    console.error("obj does not contain property carId");
    return false;
  }
  if (obj.status === undefined) {
    console.error("obj does not contain property status");
    return false;
  }
  return true;
}
