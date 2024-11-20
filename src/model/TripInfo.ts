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
  pricePer10PercentFuel: number;
  milesIncludedPerDay: number;
  milesIncludedPerTrip: number;
  startOdometr: number;
  endOdometr: number;
  overmilePrice: number;
  overmileValue: number;
  rejectedBy: string;
  tripStartedBy: string;
  tripFinishedBy: string;
  rejectedDate: Date | undefined;
  isTripRejected: boolean;
  isTripCanceled: boolean;
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
  pickUpDeliveryFeeInUsd: number;
  dropOffDeliveryFeeInUsd: number;
  depositInUsd: number;
  resolveAmountInUsd: number;
  resolveFuelAmountInUsd: number;
  resolveMilesAmountInUsd: number;
  depositReturnedInUsd: number;
  currencyRate: number;
  salesTaxInUsd: number;
  governmentTaxInUsd: number;
  totalPriceInUsd: number;

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
  guestInsuranceType?: "General Insurance ID" | "One-Time trip insurance";
  guestInsurancePhoto: string;
  guestInsuranceCompanyName: string;
  guestInsurancePolicyNumber: string;
  isCarDetailsConfirmed: boolean;
  insurancePerDayInUsd: number;
  insuranceTotalInUsd: number;
};

export const getRefuelCharge = (tripInfo: TripInfo, endFuelLevelInPercents: number) => {
  const fuelDiffsIn10Percents = Math.max((tripInfo.startFuelLevelInPercents - endFuelLevelInPercents) / 10, 0);
  return fuelDiffsIn10Percents * tripInfo.pricePer10PercentFuel;
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
  required: boolean;
};
