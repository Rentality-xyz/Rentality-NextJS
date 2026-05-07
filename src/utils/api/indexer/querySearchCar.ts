import {
  ContractLocationInfo,
  ContractSearchCarParams,
  ContractSearchCarWithDistance,
} from "@/model/blockchain/schemas";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { createGraphUrl, getSearchCarQuery } from "./indexerHelper";
import { GetCarInfosResponse, QueryCarInfo, QueryDeliveryPrice, QueryDiscountPrice, QueryTaxes } from "./schemas";
import {
  calculateDeliveryPrice,
  calculateDistance,
  calculateSumWithDiscount,
  calculateTaxes,
  calculateTotalTripDays,
} from "@/utils/computeSearch";
import carDetails from "@/components/tripCard/carDetails";

export const INDEXED_DEFAULT_DELIVERY_PRICE: QueryDeliveryPrice = {
  underTwentyFiveMilesInUsdCents: "0",
  aboveTwentyFiveMilesInUsdCents: "0",
};

export const INDEXED_DEFAULT_DISCOUNT_PRICE: QueryDiscountPrice = {
  sevenDaysDiscount: 0,
  thirtyDaysDiscount: 0,
  threeDaysDiscount: 0,
};

export const INDEXED_DEFAULT_TAXES: QueryTaxes = {
  taxesData: [],
};
export interface MappedSearchQuery extends QueryCarInfo {
  tripDays: number;
  priceWithDiscount: number;
  pricePerDayWithDiscount: number;
  pickUp: number;
  dropOf: number;
  taxesInUsdCents: number;
  distance: number;
}

export async function querySearchCar(
  searchParams: ContractSearchCarParams,
  startDateTime: number,
  endDateTime: number,
  chainId: number
): Promise<GetCarInfosResponse | null> {
  const graphUrl = createGraphUrl(chainId);

  if (graphUrl === null) return null;

  const { variables, query } = getSearchCarQuery(searchParams, startDateTime, endDateTime);

  const client = new ApolloClient({
    link: new HttpLink({
      uri: graphUrl,
    }),
    cache: new InMemoryCache(),
  });
  const { data } = await client.query<GetCarInfosResponse>({
    query: gql(query),
    variables,
  });

  return data ?? null;
}

export function mapSearchQuery(
  data: GetCarInfosResponse,
  startDateTime: number,
  endDateTime: number,
  pickUpLocation: ContractLocationInfo,
  returnLocation: ContractLocationInfo,
  userHomeLocation: ContractLocationInfo
): MappedSearchQuery[] {
  return data.carInfos
    .filter((c) => (c.trips.length > 0 && c.trips[0].trips.length === 0) || c.trips.length === 0)
    .map((c) => {
      const tripDays = calculateTotalTripDays(startDateTime, endDateTime);
      const discountPrice = c.user.user.discountPrice ?? INDEXED_DEFAULT_DISCOUNT_PRICE;
      const deliveryPrice = c.user.user.deliveryPrice ?? INDEXED_DEFAULT_DELIVERY_PRICE;
      const taxesData = c.taxes ?? INDEXED_DEFAULT_TAXES;
      const priceWithDiscount = calculateSumWithDiscount(
        tripDays,
        Number.parseInt(c.pricePerDayInUsdCents),
        discountPrice
      );
      const pricePerDayWithDiscount = priceWithDiscount / tripDays;
      const { pickUp, dropOf } = calculateDeliveryPrice(
        pickUpLocation,
        returnLocation,
        c.locationInfo.latitude,
        c.locationInfo.longitude,
        deliveryPrice
      );
      const taxes = calculateTaxes(tripDays, pricePerDayWithDiscount + pickUp + dropOf, taxesData);
      const distance = calculateDistance(
        c.locationInfo.latitude,
        c.locationInfo.longitude,
        userHomeLocation.latitude.toString(),
        userHomeLocation.longitude.toString()
      );
      return {
        ...c,
        tripDays,
        priceWithDiscount,
        pricePerDayWithDiscount,
        pickUp,
        dropOf,
        taxesInUsdCents: taxes,
        distance,
      };
    })
    .sort((a, b) => a.distance - b.distance);
}
