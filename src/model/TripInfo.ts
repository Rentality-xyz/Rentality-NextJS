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
    case TripStatus.CompletedWithoutGuestComfirmation:
      return "Completed without guest confirmation";
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
    case TripStatus.CompletedWithoutGuestComfirmation:
      return "bg-orange-400";
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
  carVinNumber: string;
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
  licenseState: string;
  tripStart: Date;
  tripEnd: Date;
  tripDays: number;
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
  milesIncludedPerTrip: number;
  startOdometr: number;
  endOdometr: number;
  overmilePrice: number;
  overmileValue: number;
  overmileCharge: number;
  rejectedBy: string;
  tripStartedBy: string;
  tripFinishedBy: string;
  rejectedDate: Date | undefined;
  createdDateTime: Date;
  approvedDateTime: Date;
  checkedInByHostDateTime: Date;
  checkedInByGuestDateTime: Date;
  checkedOutByGuestDateTime: Date;
  checkedOutByHostDateTime: Date;
  finishedDateTime: Date;
  timeZoneId: string;
  pricePerDayInUsd: number;
  totalDayPriceInUsd: number;
  totalPriceWithDiscountInUsd: number;
  deliveryFeeInUsd: number;
  depositInUsd: number;
  resolveAmountInUsd: number;
  depositReturnedInUsd: number;
  currencyRate: number;
  salesTaxInUsd: number;
  governmentTaxInUsd: number;

  host: {
    walletAddress: string;
    name: string;
    phoneNumber: string;
    photoUrl: string;
    drivingLicenseNumber: string;
    drivingLicenseExpirationDate: Date;
  };

  guest: {
    walletAddress: string;
    name: string;
    phoneNumber: string;
    photoUrl: string;
    drivingLicenseNumber: string;
    drivingLicenseExpirationDate: Date;
  };
  guestInsuranceCompanyName: string;
  guestInsurancePolicyNumber: string;
};

export const getBatteryChargeFromDiffs = (fuelDiffsInPercents: number, fullBatteryChargePriceInUsdCents: number) => {
  return (Math.floor(fuelDiffsInPercents / 10) * fullBatteryChargePriceInUsdCents) / 10;
};

export const getRefuelValueAndCharge = (tripInfo: TripInfo, endFuelLevelInPercents: number) => {
  const fuelDiffsInPercents = Math.max(tripInfo.startFuelLevelInPercents - endFuelLevelInPercents, 0);
  const refuelValue =
    tripInfo.engineType === EngineType.PETROL ? (fuelDiffsInPercents * tripInfo.tankVolumeInGal) / 100 : 0;
  const refuelCharge =
    tripInfo.engineType === EngineType.PETROL
      ? refuelValue * tripInfo.fuelPricePerGal
      : getBatteryChargeFromDiffs(fuelDiffsInPercents, tripInfo.fullBatteryChargePriceInUsdCents);
  return { refuelValue, refuelCharge };
};

export type AllowedChangeTripAction = {
  text: string;
  readonly: boolean;
  isDisplay: boolean;
  params: ChangeTripParams[];
  action: (tripId: bigint, params: string[]) => Promise<boolean>;
};

export type ChangeTripParams = {
  text: string;
  value: string;
  type: string;
};
