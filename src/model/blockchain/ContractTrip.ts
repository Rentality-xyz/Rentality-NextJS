import { validateType } from "@/utils/typeValidator";
import { TripStatus } from "../TripInfo";
import { ContractTransactionInfo, emptyContractTransactionInfo } from "./ContractTransactionInfo";

export type ContractTrip = {
  tripId: bigint;
  carId: bigint;
  status: TripStatus;
  guest: string;
  host: string;
  pricePerDayInUsdCents: bigint;
  startDateTime: bigint;
  endDateTime: bigint;
  startLocation: string;
  endLocation: string;
  milesIncludedPerDay: bigint;
  fuelPrices: bigint[];
  paymentInfo: ContractPaymentInfo;
  createdDateTime: bigint;
  approvedDateTime: bigint;
  rejectedDateTime: bigint;
  rejectedBy: string;
  checkedInByHostDateTime: bigint;
  startParamLevels: bigint[];
  checkedInByGuestDateTime: bigint;
  tripStartedBy: string;
  checkedOutByGuestDateTime: bigint;
  tripFinishedBy: string;
  endParamLevels: bigint[];
  checkedOutByHostDateTime: bigint;
  transactionInfo: ContractTransactionInfo;
  guestName: string;
  hostName: string;
  guestPhotoUrl: string;
  hostPhotoUrl: string;
};

type ContractPaymentInfo = {
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
  resolveFuelAmountInUsdCents: bigint;
  resolveMilesAmountInUsdCents: bigint;
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
  const emptyContractTrip: ContractTrip = {
    tripId: BigInt(0),
    carId: BigInt(0),
    status: TripStatus.Pending,
    guest: "",
    host: "",
    pricePerDayInUsdCents: BigInt(0),
    startDateTime: BigInt(0),
    endDateTime: BigInt(0),
    startLocation: "",
    endLocation: "",
    milesIncludedPerDay: BigInt(0),
    fuelPrices: [],
    paymentInfo: {
      tripId: BigInt(0),
      from: "",
      to: "",
      totalDayPriceInUsdCents: BigInt(0),
      taxPriceInUsdCents: BigInt(0),
      depositInUsdCents: BigInt(0),
      resolveAmountInUsdCents: BigInt(0),
      currencyType: 0,
      ethToCurrencyRate: BigInt(0),
      ethToCurrencyDecimals: BigInt(0),
      resolveFuelAmountInUsdCents: BigInt(0),
      resolveMilesAmountInUsdCents: BigInt(0),
    },
    approvedDateTime: BigInt(0),
    rejectedDateTime: BigInt(0),
    rejectedBy: "",
    checkedInByHostDateTime: BigInt(0),
    startParamLevels: [],
    checkedInByGuestDateTime: BigInt(0),
    checkedOutByGuestDateTime: BigInt(0),
    endParamLevels: [],
    checkedOutByHostDateTime: BigInt(0),
    guestName: "",
    hostName: "",
    createdDateTime: BigInt(0),
    tripFinishedBy: "",
    tripStartedBy: "",
    transactionInfo: emptyContractTransactionInfo,
    hostPhotoUrl: "",
    guestPhotoUrl: "",
  };

  return validateType(obj, emptyContractTrip);
}
