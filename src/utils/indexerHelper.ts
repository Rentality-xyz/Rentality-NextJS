import { ContractSearchCarParams } from "@/model/blockchain/schemas";
import { env } from 'process';
import { isEmpty } from '@/utils/string';
import { logger } from '@/utils/logger';


const searchCarQuery = `
  query GetCarInfos(
    $city: String
    $state: String
    $country: String
    $brand: String
    $model: String
    $yearLt: Int
    $yearGt: Int
    $tripStart: Int
    $tripEnd: Int
  ) {
    carInfos(
      where: {
        locationInfo_: { city: $city, state: $state, country: $country }
        brand: $brand
        model: $model
        yearOfProduction_lt: $yearLt
        yearOfProduction_gt: $yearGt
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
      insuranceIncluded
      host
      user {
        user {
          name
          profilePhoto
          deliveryPrice {
            underTwentyFiveMilesInUsdCents
            aboveTwentyFiveMilesInUsdCents
          }
          userCurrency {
            currency
            name
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
            endDateTime_gt: $tripStart
            endDateTime_lt: $tripEnd
            status_in: [1, 2, 3, 4]
            tripFinishedByHost: false
          }
        ) {
          id
        }
      }
    }
  }
`;

export function gerVariables(searchCarParams: ContractSearchCarParams, startDateTime: number, endDateTime: number) {
        return {
          city: searchCarParams.city,
          state: searchCarParams.state,
          country: searchCarParams.country,
          brand: searchCarParams.brand,
          model: searchCarParams.model,
          yearLt: Number(searchCarParams.yearOfProductionTo),
          yearGt: Number(searchCarParams.yearOfProductionFrom),
          tripStart: startDateTime,
          tripEnd: endDateTime
        };
}

export function createGraphUrl() {
    const baseUrl = env.INDEXER_API_URL
    if(isEmpty(baseUrl)) {
    logger.error("Create graph url: Failt to get indexer url")
    return null
    }
    const apiToken = env.INDEXER_API_TOKEN

    if(isEmpty(apiToken)) {
        logger.error("Create graph url: Failt to get api token")
        return null
        }

        const graphId = env.INDIXER_GRAPH_ID

        if(isEmpty(graphId)) {
            logger.error("Create graph url: Failt to get graph id")
            return null
        }
        return baseUrl + '/' + apiToken + '/subgraphs/id/' + graphId
}
