import { SearchCarInfo, SearchCarInfoDetails } from "@/model/SearchCarsResult";

export function getDiscountablePrice(
  totalPricePerDayWithHostDiscount: number,
  pickUpFee: number,
  dropOfFee: number,
  taxes: number
) {
  return totalPricePerDayWithHostDiscount + pickUpFee + dropOfFee + taxes;
}

export function getDiscountablePriceFromCarInfo(carInfo: SearchCarInfoDetails | SearchCarInfo) {
    return getDiscountablePrice(
        carInfo.pricePerDayWithHostDiscount * carInfo.tripDays,
        carInfo.deliveryDetails.pickUp.priceInUsd,
        carInfo.deliveryDetails.dropOff.priceInUsd,
        carInfo.taxes
      )

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

export function getPromoPrice(carInfo: SearchCarInfoDetails | SearchCarInfo, promoValue: number) {
  if (promoValue <= 0) return getDiscountablePriceFromCarInfo(carInfo) + getNotDiscountablePriceFromCarInfo(carInfo);
  if (promoValue === 100) return 0;
  return (
    getDiscountablePriceFromCarInfo(carInfo) * (1 - promoValue / 100) + getNotDiscountablePriceFromCarInfo(carInfo)
  );
}

export function getTotalPrice(
  pricePerDay: number,
  tripDays: number,
  pickUpFee: number,
  dropOfFee: number,
  taxes: number,
  insuranceFee: number,
  securityDeposit: number
) {
  return (
    getDiscountablePrice(pricePerDay * tripDays, pickUpFee, dropOfFee, taxes) +
    getNotDiscountablePrice(insuranceFee, securityDeposit)
  );
}
