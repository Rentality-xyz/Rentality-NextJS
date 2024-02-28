import { EngineType } from "./EngineType";

export enum TripStatus {
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

export type TripInfo = {
  tripId: number;
  carId: number;
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
  totalPrice: string;
  tankVolumeInGal: number;
  startFuelLevelInPercents: number;
  endFuelLevelInPercents: number;
  engineType: EngineType;
  fuelPricePerGal: number;
  batteryPrices: { price_0_20: number; price_21_50: number; price_51_80: number; price_81_100: number };
  milesIncludedPerDay: number;
  startOdometr: number;
  endOdometr: number;
  overmilePrice: number;
  depositPaid: number;
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
};

export const getBatteryCharge = (
  fuelDiffsInPercents: number,
  batteryPrices: { price_0_20: number; price_21_50: number; price_51_80: number; price_81_100: number }
) => {
  if (fuelDiffsInPercents <= 20) return batteryPrices.price_0_20;
  if (fuelDiffsInPercents <= 50) return batteryPrices.price_21_50;
  if (fuelDiffsInPercents <= 80) return batteryPrices.price_51_80;
  return batteryPrices.price_81_100;
};

export const getBatteryChargeFromDiffs = (
  fuelDiffsInPercents: number,
  batteryPrices: { price_0_20: number; price_21_50: number; price_51_80: number; price_81_100: number }
) => {
  if (fuelDiffsInPercents <= 20) return batteryPrices.price_81_100;
  if (fuelDiffsInPercents <= 50) return batteryPrices.price_51_80;
  if (fuelDiffsInPercents <= 80) return batteryPrices.price_21_50;
  return batteryPrices.price_0_20;
};

export const getRefuelValueAndCharge = (tripInfo: TripInfo, endFuelLevelInPercents: number) => {
  const fuelDiffsInPercents = Math.max(tripInfo.startFuelLevelInPercents - endFuelLevelInPercents, 0);
  const refuelValue =
    tripInfo.engineType === EngineType.PATROL ? (fuelDiffsInPercents * tripInfo.tankVolumeInGal) / 100 : 0;
  const refuelCharge =
    tripInfo.engineType === EngineType.PATROL
      ? refuelValue * tripInfo.fuelPricePerGal
      : getBatteryChargeFromDiffs(fuelDiffsInPercents, tripInfo.batteryPrices);
  return { refuelValue, refuelCharge };
};

export type AllowedChangeTripAction = {
  text: string;
  readonly: boolean;
  params: ChangeTripParams[];
  action: (tripId: bigint, params: string[]) => Promise<boolean>;
};

export type ChangeTripParams = {
  text: string;
  value: string;
  type: string;
};
