export type ContractTrip = {
  carId: number;
  tripRequestId: number;
  status: number; //TripStatus
  guest: string;
  host: string;
  startDateTime: number;
  endDateTime: number;
  startLocation: string;
  endLocation: string;
  milesIncluded: number;
  totalDayPrice: number;
  taxPrice: number;
  deposit: number;
  isAccepted: boolean;
  checkedInByHostDateTime: number;
  startFuelLevel: number;
  startOdometr: number;
  checkedInByGuestDateTime: number;
  checkedOutByGuestDateTime: number;
  endFuelLevel: number;
  endOdometr: number;
  checkedOutByHostDateTime: number;
  resolveAmount: number;
};

export function validateContractTrip(obj: ContractTrip): obj is ContractTrip {
  if (typeof obj !== "object" || obj === null) return false;

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
