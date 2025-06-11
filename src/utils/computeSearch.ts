import { ContractLocationInfo, TaxesType } from "@/model/blockchain/schemas";
import { QueryDiscountPrice, QueryDeliveryPrice, QueryLocationInfo, QueryTaxes } from "./api/indexer/schemas";

export function calculateSumWithDiscount(daysOfTrip: number, price: number, discount: QueryDiscountPrice) {
     let discountPercent;

    if (daysOfTrip >= 3 && daysOfTrip < 7) {
      discountPercent = discount.threeDaysDiscount;
    } else if (daysOfTrip >= 7 && daysOfTrip < 30) {
      discountPercent = discount.sevenDaysDiscount;
    } else if (daysOfTrip >= 30) {
      discountPercent = discount.thirtyDaysDiscount;
    } else {
      return price * daysOfTrip;
    }

    return (price * daysOfTrip * (1_000_000 - discountPercent)) / 1_000_000;
  }

  export function calculateTotalTripDays(startDateTime: number, endDateTime: number) {
     const oneDayInSec = 86400;
     return Math.ceil((endDateTime - startDateTime) / oneDayInSec)
  }

  export function calculateTaxes(tripDays: number, totalCost: number, taxesData: QueryTaxes) {
    let totalTax = 0;
    for(let i = 0; i < taxesData.taxesData.length; i++) {
      if(Number.parseInt(taxesData.taxesData[i].tType) == Number(TaxesType.PPM)) {
        totalTax += totalCost * Number.parseInt(taxesData.taxesData[i].value) / 1_000_000;
      }
      else if(Number.parseInt(taxesData.taxesData[i].tType) ==  Number(TaxesType.InUsdCents)) {
        totalTax += Number(taxesData.taxesData[i].value);
      }
      else if(Number.parseInt(taxesData.taxesData[i].tType) == Number(TaxesType.InUsdCentsPerDay)) {
         totalTax += tripDays * Number(taxesData.taxesData[i].value);
      }
    }
    return totalTax
}

export function calculateDeliveryPrice(
    pickUpLoc: ContractLocationInfo,
    returnLoc: ContractLocationInfo,
    homeLat: string,
    homeLon: string,
    deliveryData: QueryDeliveryPrice) {
        const pickUpDistance = calculateDistance(
            pickUpLoc.latitude.toString(),
            pickUpLoc.longitude.toString(),
            homeLat,
            homeLon
        )
        const returnDistance = calculateDistance(
            returnLoc.latitude.toString(),
            returnLoc.longitude.toString(),
            homeLat,
            homeLon
        )
        let pickUp = 0;
        let dropOf = 0;

        if (pickUpDistance > 25) {
            pickUp += pickUpDistance * Number.parseInt(deliveryData.aboveTwentyFiveMilesInUsdCents);
          } else {
            pickUp += pickUpDistance * Number.parseInt(deliveryData.underTwentyFiveMilesInUsdCents);
          }
          if (returnDistance > 25) {
            dropOf += returnDistance * Number.parseInt(deliveryData.aboveTwentyFiveMilesInUsdCents);
          } else {
            dropOf += returnDistance * Number.parseInt(deliveryData.underTwentyFiveMilesInUsdCents);
          }
          return {pickUp, dropOf};
    }


function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  export function calculateDistance(
    lat1: string,
    lon1: string,
    lat2: string,
    lon2: string
  ): number {
    const φ1 = parseFloat(lat1);
    const λ1 = parseFloat(lon1);
    const φ2 = parseFloat(lat2);
    const λ2 = parseFloat(lon2);
  
    if (isNaN(φ1) || isNaN(λ1) || isNaN(φ2) || isNaN(λ2)) {
      return 0;
    }
  
    const R = 3958.8;
    
    const Δφ = toRadians(φ2 - φ1);
    const Δλ = toRadians(λ2 - λ1);
    
    const radφ1 = toRadians(φ1);
    const radφ2 = toRadians(φ2);
  
    const a = 
      Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(radφ1) * Math.cos(radφ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
  
  export function calculateDistances(
    pickUpLoc: QueryLocationInfo,
    returnLoc: QueryLocationInfo,
    homeLat: string,
    homeLon: string
  ): [number, number] {
    const pickUpDistance = (!pickUpLoc.latitude || !pickUpLoc.longitude)
      ? 0
      : calculateDistance(
          pickUpLoc.latitude,
          pickUpLoc.longitude,
          homeLat,
          homeLon
        );
  
    const returnDistance = (!returnLoc.latitude || !returnLoc.longitude)
      ? 0
      : calculateDistance(
          returnLoc.latitude,
          returnLoc.longitude,
          homeLat,
          homeLon
        );
  
    return [pickUpDistance, returnDistance];
  }