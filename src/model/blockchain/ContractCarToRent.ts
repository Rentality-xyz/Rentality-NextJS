export type ContractCarToRent = {
  tokenId: number;
  carId: number;
  owner: string;
  pricePerDayInUsdCents: string;
  currentlyListed: boolean;
};

export function validateContractCarToRent(
  obj: ContractCarToRent
): obj is ContractCarToRent {
  if (typeof obj !== "object" || obj === null) return false;

  if (obj.tokenId === undefined) {
    console.error("obj does not contain property tokenId");
    return false;
  }
  if (obj.carId === undefined) {
    console.error("obj does not contain property carId");
    return false;
  }
  if (obj.owner === undefined) {
    console.error("obj does not contain property owner");
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
