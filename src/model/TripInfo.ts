export enum TripStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  CheckedInByHost = "checkedInByHost",
  Started = "started",
  CheckedOutByGuest = "checkedOutByGuest",
  Finished = "finished",
  Closed = "closed",
  Rejected = "rejected",
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
  startFuelLevelInGal: number;
  endFuelLevelInGal: number;
  fuelPricePerGal: number;
  milesIncludedPerDay: number;
  startOdometr: number;
  endOdometr: number;
  overmilePrice: number;
  hostMobileNumber: string;
  guestMobileNumber: string;
};

export function getGalsFromFuelLevel(
  tripInfo: TripInfo,
  fuelLevel: number
): number {
  return Math.floor(fuelLevel * tripInfo.tankVolumeInGal);
}

export function getFuelLevelFromGals(
  tripInfo: TripInfo,
  fuelLevelInGal: number
): number {
  return (
    Math.ceil((8 * Number(fuelLevelInGal)) / tripInfo.tankVolumeInGal) * 0.125
  );
}

export function getFuelLevelFromGalsString(
  tripInfo: TripInfo,
  fuelLevelInGal: number
): string {
  const level =
    Math.ceil((8 * Number(fuelLevelInGal)) / tripInfo.tankVolumeInGal) * 0.125;
  switch (level) {
    case 0.125:
      return "1/8";
    case 0.25:
      return "1/4";
    case 0.375:
      return "3/8";
    case 0.5:
      return "1/2";
    case 0.625:
      return "5/8";
    case 0.75:
      return "3/4";
    case 0.875:
      return "7/8";
    case 1:
      return "full";
    default:
    case 0:
      return "0";
  }
}

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
