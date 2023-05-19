export type ContractCarInfo = {
  carId: number;
  carVinNumber: string;
  createdBy: string;
  pricePerDayInUsdCents: number;
  tankVolumeInGal: number;
  distanceIncludedInMi: number;
  currentlyListed: boolean;
};

export function validateContractCarInfo(
  obj: ContractCarInfo
): obj is ContractCarInfo {
  if (typeof obj !== "object" || obj === null) return false;

  if (obj.carId === undefined) {
    console.error("obj does not contain property carId");
    return false;
  }
  if (obj.createdBy === undefined) {
    console.error("obj does not contain property createdBy");
    return false;
  }
  if (obj.pricePerDayInUsdCents === undefined) {
    console.error("obj does not contain property pricePerDayInUsdCents");
    return false;
  }
  if (obj.currentlyListed === undefined) {
    console.error("obj does not contain property currentlyListed");
    return false;
  }
  return true;
}
