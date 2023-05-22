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
