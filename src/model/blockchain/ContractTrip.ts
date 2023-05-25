import { TripStatus } from "../TripInfo";

export type ContractTrip = {
  tripId: bigint;
  carId: bigint;
  status: number; //TripStatus
  guest: string;
  host: string;
  startDateTime: number;
  endDateTime: number;
  startLocation: string;
  endLocation: string;
  milesIncluded: number;
  paymentInfo: PaymentInfo;
  approvedDateTime: number;
  checkedInByHostDateTime: number;
  startFuelLevel: number;
  startOdometr: number;
  checkedInByGuestDateTime: number;
  checkedOutByGuestDateTime: number;
  endFuelLevel: number;
  endOdometr: number;
  checkedOutByHostDateTime: number;
  resolveAmount: bigint;
};

type PaymentInfo = {
  tripRequestId: bigint;
  from: string;
  to: string;
  totalDayPriceInUsdCents: bigint;
  taxPriceInUsdCents: bigint;
  depositInUsdCents: bigint;
  currencyType: number;
  ethToCurrencyRate: bigint;
  ethToCurrencyDecimals: bigint;
};

export const getTripStatusFromContract = (status: number) => {
  switch (status) {
    case 0:
      return TripStatus.Pending;
    case 1:
      return TripStatus.Comfirmed;
    case 2:
      return TripStatus.StartedByHost;
    case 3:
      return TripStatus.Started;
    case 4:
      return TripStatus.FinishedByGuest;
    case 5:
      return TripStatus.Finished;
    case 6:
      return TripStatus.Closed;
    case 7:
    default:
      return TripStatus.Rejected;
  }
};

export const getTripStatusTextFromContract = (status: number) => {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Comfirmed";
    case 2:
      return "StartedByHost";
    case 3:
      return "Started";
    case 4:
      return "FinishedByGuest";
    case 5:
      return "Finished";
    case 6:
      return "Closed";
    case 7:
    default:
      return "Rejected";
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
