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
      return "Finished";
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
  allowedActions:AllowedChangeTripAction[];
  totalPrice: string;
};

export type AllowedChangeTripAction = {
  text:string;
  readonly:boolean;
  params:ChangeTripParams[];
  action:(tripId: bigint,  params:string[]) => Promise<boolean>
}

export type ChangeTripParams ={
  text:string;
  value:string;
  type:string;
}