import { EngineType, TripStatus } from "./blockchain/schemas";

export enum TripStatusEnum {
  Pending, // Created
  Confirmed, // Approved
  CheckedInByHost, // CheckedInByHost
  Started, // CheckedInByGuest
  CheckedOutByGuest, //CheckedOutByGuest
  Finished, //CheckedOutByHost
  Closed, //Finished
  Rejected, //Canceled
}

export const getTripStatusTextFromStatus = (status: TripStatus) => {
  switch (status) {
    case TripStatus.Pending:
      return "Pending";
    case TripStatus.Confirmed:
      return "Confirmed";
    case TripStatus.CheckedInByHost:
      return "Started";
    case TripStatus.Started:
      return "On the trip";
    case TripStatus.CheckedOutByGuest:
      return "Finished by guest";
    case TripStatus.Finished:
      return "Finished";
    case TripStatus.Closed:
      return "Completed";
    case TripStatus.Rejected:
    default:
      return "Rejected";
  }
};

export const getTripStatusBgColorClassFromStatus = (status: TripStatus) => {
  switch (status) {
    case TripStatus.Pending:
      return "bg-yellow-600";
    case TripStatus.Confirmed:
      return "bg-lime-500";
    case TripStatus.CheckedInByHost:
      return "bg-blue-600";
    case TripStatus.Started:
      return "bg-blue-800";
    case TripStatus.CheckedOutByGuest:
      return "bg-purple-600";
    case TripStatus.Finished:
      return "bg-purple-800";
    case TripStatus.Closed:
      return "bg-fuchsia-700";
    case TripStatus.Rejected:
    default:
      return "bg-red-500";
  }
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

export type TripInfo = {
  tripId: number;
  carId: number;
  carDescription: string;
  carDoorsNumber: number;
  carSeatsNumber: number;
  carTransmission: string;
  carColor: string;
  image: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  tripStart: Date;
  tripEnd: Date;
  locationStart: string;
  locationEnd: string;
  status: TripStatus;
  allowedActions: AllowedChangeTripAction[];
  tankVolumeInGal: number;
  startFuelLevelInPercents: number;
  endFuelLevelInPercents: number;
  engineType: EngineType;
  fuelPricePerGal: number;
  fullBatteryChargePriceInUsdCents: number;
  milesIncludedPerDay: number;
  startOdometr: number;
  endOdometr: number;
  overmilePrice: number;
  hostPhoneNumber: string;
  guestPhoneNumber: string;
  hostAddress: string;
  hostName: string;
  guestAddress: string;
  guestName: string;
  rejectedBy: string;
  rejectedDate: Date | undefined;
  createdDateTime: Date;
  checkedInByHostDateTime: Date;
  checkedOutByGuestDateTime: Date;
  checkedOutByHostDateTime: Date;
  guestPhotoUrl: string;
  hostPhotoUrl: string;
  timeZoneId: string;
  pricePerDayInUsd: number;
  totalDayPriceInUsd: number;
  totalPriceWithDiscountInUsd: number;
  taxPriceInUsd: number;
  depositInUsd: number;
  resolveAmountInUsd: number;
  depositReturnedInUsd: number;
  currencyRate: number;
  insuranceCompany: string;
  insuranceNumber: string;
};

export const getBatteryChargeFromDiffs = (fuelDiffsInPercents: number, fullBatteryChargePriceInUsdCents: number) => {
  return (Math.floor(fuelDiffsInPercents / 10) * fullBatteryChargePriceInUsdCents) / 10;
};

export const getRefuelValueAndCharge = (tripInfo: TripInfo, endFuelLevelInPercents: number) => {
  const fuelDiffsInPercents = Math.max(tripInfo.startFuelLevelInPercents - endFuelLevelInPercents, 0);
  const refuelValue =
    tripInfo.engineType === EngineType.PATROL ? (fuelDiffsInPercents * tripInfo.tankVolumeInGal) / 100 : 0;
  const refuelCharge =
    tripInfo.engineType === EngineType.PATROL
      ? refuelValue * tripInfo.fuelPricePerGal
      : getBatteryChargeFromDiffs(fuelDiffsInPercents, tripInfo.fullBatteryChargePriceInUsdCents);
  return { refuelValue, refuelCharge };
};

export type AllowedChangeTripAction = {
  text: string;
  readonly: boolean;
  params: ChangeTripParams[];
  action: (tripId: bigint, params: string[], insuranceCompany: string, insuranceNumber: string) => Promise<boolean>;
};

export type ChangeTripParams = {
  text: string;
  value: string;
  type: string;
};
