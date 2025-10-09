import { ContractSearchCarParams } from "@/model/blockchain/schemas";
import { env } from 'process';
import { isEmpty } from '@/utils/string';
import { logger } from '@/utils/logger';
import getIndexerUrlFromEnv from "./indexerUrl";

export function getSearchCarQuery(searchCarParams: ContractSearchCarParams, startDateTime: number, endDateTime: number) {
  const variables: Record<string, any> = {
    tripStart: startDateTime,
    tripEnd: endDateTime
  };

  if (searchCarParams.city.length > 0) variables.city = searchCarParams.city;
  if (searchCarParams.state.length > 0) variables.state = searchCarParams.state;
  if (searchCarParams.country.length > 0) variables.country = searchCarParams.country;
  
  if (searchCarParams.brand.length > 0) variables.brand = searchCarParams.brand;
  if (searchCarParams.model.length > 0) variables.model = searchCarParams.model;
  
  if (searchCarParams.yearOfProductionFrom !== BigInt(0)) {
    variables.yearGt = Number(searchCarParams.yearOfProductionFrom);
  }
  if (searchCarParams.yearOfProductionTo !== BigInt(0)) {
    variables.yearLt = Number(searchCarParams.yearOfProductionTo);
  }
  
  if (searchCarParams.pricePerDayInUsdCentsFrom !== BigInt(0)) {
    variables.priceGte = Number(searchCarParams.pricePerDayInUsdCentsFrom);
  }
  if (searchCarParams.pricePerDayInUsdCentsTo !== BigInt(0)) {
    variables.priceLte = Number(searchCarParams.pricePerDayInUsdCentsTo);
  }

  const locationClause = `
    locationInfo_: {
      ${variables.city !== undefined ? 'city: $city,' : ''}
      ${variables.state !== undefined ? 'state: $state,' : ''}
      ${variables.country !== undefined ? 'country: $country,' : ''}
    },
  `;

  const otherClauses = `
    ${variables.brand !== undefined ? 'brand: $brand,' : ''}
    ${variables.model !== undefined ? 'model: $model,' : ''}
    ${variables.yearGt !== undefined ? 'yearOfProduction_gt: $yearGt,' : ''}
    ${variables.yearLt !== undefined ? 'yearOfProduction_lt: $yearLt,' : ''}
    ${variables.priceGte !== undefined ? 'pricePerDayInUsdCents_gte: $priceGte,' : ''}
    ${variables.priceLte !== undefined ? 'pricePerDayInUsdCents_lte: $priceLte,' : ''}
  `;

  return {
    query: `
      query GetCarInfos(
        ${variables.city !== undefined ? '$city: String,' : ''}
        ${variables.state !== undefined ? '$state: String,' : ''}
        ${variables.country !== undefined ? '$country: String,' : ''}
        ${variables.brand !== undefined ? '$brand: String,' : ''}
        ${variables.model !== undefined ? '$model: String,' : ''}
        ${variables.yearGt !== undefined ? '$yearGt: Int,' : ''}
        ${variables.yearLt !== undefined ? '$yearLt: Int,' : ''}
        ${variables.priceGte !== undefined ? '$priceGte: Int,' : ''}
        ${variables.priceLte !== undefined ? '$priceLte: Int,' : ''}
        $tripStart: Int!
        $tripEnd: Int!
      ) {
        carInfos(
          where: {
            ${locationClause}
            ${otherClauses}
            currentlyListed: true
          }
        ) {
          carId
          host
          brand
          model
          yearOfProduction
          pricePerDayInUsdCents
          securityDepositPerTripInUsdCents
          engineType
          milesIncludedPerDay
          tokenURI
          insuranceIncluded,
          dimoTokenId,
          insuranceCarInfo {
           required,
           priceInUsdCents  
          },
          engineParams
          user {
            user {
              name
              profilePhoto
              deliveryPrice {
                underTwentyFiveMilesInUsdCents
                aboveTwentyFiveMilesInUsdCents
              }
              discountPrice {
                sevenDaysDiscount,
                thirtyDaysDiscount,
                threeDaysDiscount
              }
              userCurrency {
                currency
                name
                initialized
              }
            }
          }
          taxes {
            taxesData {
              value
              tType
            }
          }
          locationInfo {
            city
            country
            state
            latitude
            longitude
            timeZoneId
          }
          trips {
            trips(
              where: {
                startDateTime_lt: $tripEnd
                endDateTime_gt: $tripStart
                status_in: [1, 2, 3, 4]
                tripFinishedByHost: false
              }
            ) {
              id
            }
          }
        }
      }
    `,
    variables
  };
}
export function createGraphUrl(chainId: number) {
    const baseUrl = getIndexerUrlFromEnv(chainId)
    if(isEmpty(baseUrl)) {
    logger.error("Create graph url: Failt to get indexer url")
    return null
    }
   return baseUrl 
}
