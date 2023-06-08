export enum TripStatus {
  Pending = "pending",
  Comfirmed = "comfirmed",
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
    case TripStatus.Comfirmed:
      return "Comfirmed";
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
  params:string[];
  action:(tripId: number,  params:string[]) => Promise<boolean>
}