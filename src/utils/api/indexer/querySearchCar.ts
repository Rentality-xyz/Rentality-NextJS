import { ContractLocationInfo, ContractSearchCarParams, ContractSearchCarWithDistance } from "@/model/blockchain/schemas";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { createGraphUrl, getSearchCarQuery } from "./indexerHelper";
import { GetCarInfosResponse, QueryCarInfo } from "./schemas";
import { calculateDeliveryPrice, calculateDistance, calculateSumWithDiscount, calculateTaxes, calculateTotalTripDays } from "@/utils/computeSearch";
export interface MappedSearchQuery extends QueryCarInfo  {
    tripDays: number,
    priceWithDiscount: number,
    pricePerDayWithDiscount: number,
    pickUp: number,
    dropOf: number,
    taxesInUsdCents: number,
    distance: number,
}

export async function querySearchCar(searchParams: ContractSearchCarParams, startDateTime: number, endDateTime: number) {
    const graphUrl = createGraphUrl()
    
    if(graphUrl === null)
        return null 

    const {variables,query} = getSearchCarQuery(searchParams, startDateTime, endDateTime)

    const client = new ApolloClient({
        uri: graphUrl,
        cache: new InMemoryCache(),
      })
      const response = await client
     .query({
     query: gql(query),
     variables,
   })
  
   return response.data

}

export function mapSearchQuery(
    data: GetCarInfosResponse,
    startDateTime: number, endDateTime: number, pickUpLocation: ContractLocationInfo, returnLocation: ContractLocationInfo, userHomeLocation: ContractLocationInfo): MappedSearchQuery[] {
  return data.carInfos.filter(c => c.trips.length > 0 && c.trips[0].trips.length === 0).
    map(c =>{ 
        const tripDays = calculateTotalTripDays(startDateTime, endDateTime)
        const priceWithDiscount = calculateSumWithDiscount(tripDays, Number.parseInt(c.pricePerDayInUsdCents), c.user.user.discountPrice)
        const pricePerDayWithDiscount = priceWithDiscount / tripDays;
        const {pickUp, dropOf} = calculateDeliveryPrice(pickUpLocation, returnLocation, c.locationInfo.latitude, c.locationInfo.longitude, c.user.user.deliveryPrice)
        const taxes = calculateTaxes(tripDays, pricePerDayWithDiscount  + pickUp + dropOf, c.taxes)
        const distance = calculateDistance(c.locationInfo.latitude, c.locationInfo.longitude, userHomeLocation.latitude.toString(), userHomeLocation.longitude.toString())
        return {
            ...c,
            tripDays,
            priceWithDiscount,
            pricePerDayWithDiscount,
            pickUp,
            dropOf,
            taxesInUsdCents: taxes,
            distance
        }

    }).sort((a, b) => a.distance - b.distance);
}

export function mapRawCarToContractSearchCarWithDistance(raw: any): ContractSearchCarWithDistance {
    console.log(raw)
    return {
      distance: BigInt(Math.floor(raw.distance ?? 0)),
      car: {
        carId: BigInt(raw.carId),
        brand: raw.brand,
        model: raw.model,
        yearOfProduction: BigInt(raw.yearOfProduction),
        pricePerDayInUsdCents: BigInt(raw.pricePerDayInUsdCents),
        pricePerDayWithDiscount: BigInt(raw.pricePerDayWithDiscount),
        tripDays: BigInt(raw.tripDays),
        totalPriceWithDiscount: BigInt(raw.priceWithDiscount),
        taxes: BigInt(Math.floor(raw.taxes ?? 0)),
        securityDepositPerTripInUsdCents: BigInt(raw.securityDepositPerTripInUsdCents),
        engineType: raw.engineType,
        milesIncludedPerDay: BigInt(raw.milesIncludedPerDay),
        host: raw.host,
        hostName: raw.user?.user?.name ?? '',
        hostPhotoUrl: raw.user?.user?.profilePhoto ?? '',
        metadataURI: raw.tokenURI,
        underTwentyFiveMilesInUsdCents: BigInt(
          raw.user?.user?.deliveryPrice?.underTwentyFiveMilesInUsdCents ?? 0
        ),
        aboveTwentyFiveMilesInUsdCents: BigInt(
          raw.user?.user?.deliveryPrice?.aboveTwentyFiveMilesInUsdCents ?? 0
        ),
        insuranceInfo: {
            required: raw.insuranceCarInfo?.required,
            priceInUsdCents: raw.insuranceCarInfo?.priceInUsdCents
        },
        pickUp: BigInt(raw.pickUp ?? 0),
        dropOf: BigInt(raw.dropOf ?? 0),
        insuranceIncluded: raw.insuranceIncluded ?? false,
        locationInfo: {
          city: raw.locationInfo?.city ?? '',
          state: raw.locationInfo?.state ?? '',
          country: raw.locationInfo?.country ?? '',
          latitude: raw.locationInfo?.latitude ?? '0',
          longitude: raw.locationInfo?.longitude ?? '0',
          timeZoneId: raw.locationInfo?.timeZoneId ?? '',
          userAddress: raw.locatationInfo?.userAddress ?? ''
        },
    
        isGuestHasInsurance: false,
        dimoTokenId: BigInt(raw.dimoTokenId ?? 0), 
        hostCurrency: raw.user?.user?.userCurrency ?? {
          currency: raw.user?.user?.userCurrency?.currency,
          name: raw.user?.user?.userCurrency?.name
        }
      }
    };
  }
