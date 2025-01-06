import { SearchCarInfo, SearchCarInfoDetails } from "@/model/SearchCarsResult";

export function getDiscountablePrice(
  pricePerDay: number,
  tripDays: number,
  pickUpFee: number,
  dropOfFee: number,
  salesTax: number,
  governmentTax: number
) {
  return pricePerDay * tripDays + pickUpFee + dropOfFee + salesTax + governmentTax;
}

export function getDiscountablePriceFromCarInfo(carInfo: SearchCarInfoDetails | SearchCarInfo) {
  return "salesTax" in carInfo
    ? getDiscountablePrice(
        carInfo.pricePerDay,
        carInfo.tripDays,
        carInfo.deliveryDetails.pickUp.priceInUsd,
        carInfo.deliveryDetails.dropOff.priceInUsd,
        carInfo.salesTax,
        carInfo.governmentTax
      )
    : getDiscountablePrice(
        carInfo.pricePerDay,
        carInfo.tripDays,
        carInfo.deliveryDetails.pickUp.priceInUsd,
        carInfo.deliveryDetails.dropOff.priceInUsd,
        carInfo.taxes,
        0
      );
}

export function getNotDiscountablePrice(insuranceFee: number, securityDeposit: number) {
  return insuranceFee + securityDeposit;
}

export function getNotDiscountablePriceFromCarInfo(carInfo: SearchCarInfoDetails | SearchCarInfo) {
  const insuranceCharge =
    carInfo.isInsuranceRequired && !carInfo.isGuestHasInsurance
      ? carInfo.insurancePerDayPriceInUsd * carInfo.tripDays
      : 0;
  return getNotDiscountablePrice(insuranceCharge, carInfo.securityDeposit);
}

export function getTotalPrice(
  pricePerDay: number,
  tripDays: number,
  pickUpFee: number,
  dropOfFee: number,
  salesTax: number,
  governmentTax: number,
  insuranceFee: number,
  securityDeposit: number
) {
  return (
    getDiscountablePrice(pricePerDay, tripDays, pickUpFee, dropOfFee, salesTax, governmentTax) +
    getNotDiscountablePrice(insuranceFee, securityDeposit)
  );
}
