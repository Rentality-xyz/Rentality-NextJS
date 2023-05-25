export enum TripStatus {
  Pending = "pending",
  Comfirmed = "comfirmed",
  StartedByHost = "startedByHost",
  Started = "started",
  FinishedByGuest = "finishedByGuest",
  Finished = "finished",
  Closed = "closed",
  Rejected = "rejected",
}

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
  statusText: string;
  allowedActions:AllowedChangeTripAction[]
};

export type AllowedChangeTripAction = {
  text:string;
  action:(tripId: number) => Promise<boolean>
}