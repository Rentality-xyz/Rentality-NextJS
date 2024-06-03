import { useCallback, useState } from "react";
import { calculateDays } from "@/utils/date";
import { SearchCarInfo, SearchCarsResult, emptySearchCarsResult } from "@/model/SearchCarsResult";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { useRentality } from "@/contexts/rentalityContext";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import moment from "moment";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractCreateTripRequest,
  ContractCreateTripRequestWithDelivery,
  ContractDeliveryLocations,
  ContractLocationInfo,
} from "@/model/blockchain/schemas";
import { isEmpty } from "@/utils/string";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { bigIntReplacer } from "@/utils/json";

export type SortOptions = {
  [key: string]: string;
};
export type SortOptionKey = keyof SortOptions;

const useSearchCars = () => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchCarsResult>(emptySearchCarsResult);

  const searchAvailableCars = async (searchCarRequest: SearchCarRequest) => {
    try {
      setIsLoading(true);

      var url = new URL(`/api/publicSearchCars`, window.location.origin);
      if (ethereumInfo?.chainId) url.searchParams.append("chainId", ethereumInfo.chainId.toString());
      if (searchCarRequest.dateFrom) url.searchParams.append("dateFrom", searchCarRequest.dateFrom);
      if (searchCarRequest.dateTo) url.searchParams.append("dateTo", searchCarRequest.dateTo);
      if (searchCarRequest.searchLocation.country)
        url.searchParams.append("country", searchCarRequest.searchLocation.country);
      if (searchCarRequest.searchLocation.state)
        url.searchParams.append("state", searchCarRequest.searchLocation.state);
      if (searchCarRequest.searchLocation.city) url.searchParams.append("city", searchCarRequest.searchLocation.city);
      if (searchCarRequest.searchFilters.brand) url.searchParams.append("brand", searchCarRequest.searchFilters.brand);
      if (searchCarRequest.searchFilters.model) url.searchParams.append("model", searchCarRequest.searchFilters.model);
      if (searchCarRequest.searchFilters.yearOfProductionFrom)
        url.searchParams.append("yearOfProductionFrom", searchCarRequest.searchFilters.yearOfProductionFrom);
      if (searchCarRequest.searchFilters.yearOfProductionTo)
        url.searchParams.append("yearOfProductionTo", searchCarRequest.searchFilters.yearOfProductionTo);
      if (searchCarRequest.searchFilters.pricePerDayInUsdFrom)
        url.searchParams.append("pricePerDayInUsdFrom", searchCarRequest.searchFilters.pricePerDayInUsdFrom);
      if (searchCarRequest.searchFilters.pricePerDayInUsdTo)
        url.searchParams.append("pricePerDayInUsdTo", searchCarRequest.searchFilters.pricePerDayInUsdTo);
      if (searchCarRequest.isDeliveryToGuest)
        url.searchParams.append("isDeliveryToGuest", searchCarRequest.isDeliveryToGuest ? "true" : "false");
      if (
        searchCarRequest.isDeliveryToGuest &&
        !searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation &&
        !isEmpty(searchCarRequest.deliveryInfo.pickupLocation.locationInfo.address)
      )
        url.searchParams.append(
          "pickupLocation",
          `${searchCarRequest.deliveryInfo.pickupLocation.locationInfo.latitude.toFixed(6)};${searchCarRequest.deliveryInfo.pickupLocation.locationInfo.longitude.toFixed(6)}`
        );
      if (
        searchCarRequest.isDeliveryToGuest &&
        !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation &&
        !isEmpty(searchCarRequest.deliveryInfo.returnLocation.locationInfo.address)
      )
        url.searchParams.append(
          "returnLocation",
          `${searchCarRequest.deliveryInfo.returnLocation.locationInfo.latitude.toFixed(6)};${searchCarRequest.deliveryInfo.returnLocation.locationInfo.longitude.toFixed(6)}`
        );

      const apiResponse = await fetch(url);

      if (!apiResponse.ok) {
        console.error(`searchAvailableCars fetch error: + ${apiResponse.statusText}`);
        return;
      }

      const apiJson = await apiResponse.json();
      if (!Array.isArray(apiJson)) {
        console.error("searchAvailableCars fetch wrong response format:");
        return;
      }

      const availableCarsData = apiJson as SearchCarInfo[];

      setSearchResult({
        searchCarRequest: searchCarRequest,
        carInfos: availableCarsData,
      });
      return true;
    } catch (e) {
      console.error("updateData error:" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createTripRequest = async (carId: number, searchCarRequest: SearchCarRequest, timeZoneId: string) => {
    if (ethereumInfo === null) {
      console.error("createTripRequest: ethereumInfo is null");
      return false;
    }
    if (rentalityContract === null) {
      console.error("createTripRequest: rentalityContract is null");
      return false;
    }

    try {
      const startCarLocalDateTime = moment.tz(searchCarRequest.dateFrom, timeZoneId).toDate();
      const endCarLocalDateTime = moment.tz(searchCarRequest.dateTo, timeZoneId).toDate();

      const days = calculateDays(startCarLocalDateTime, endCarLocalDateTime);
      if (days < 0) {
        console.error("Date to' must be greater than 'Date from'");
        return false;
      }
      const startUnixTime = getBlockchainTimeFromDate(startCarLocalDateTime);
      const endUnixTime = getBlockchainTimeFromDate(endCarLocalDateTime);

      if (searchCarRequest.isDeliveryToGuest) {
        const carDeliveryData = await rentalityContract.getDeliveryData(BigInt(carId));
        const carLocationInfo: ContractLocationInfo = {
          userAddress: carDeliveryData.locationInfo.userAddress,
          country: carDeliveryData.locationInfo.country,
          state: carDeliveryData.locationInfo.state,
          city: carDeliveryData.locationInfo.city,
          latitude: carDeliveryData.locationInfo.latitude,
          longitude: carDeliveryData.locationInfo.longitude,
          timeZoneId: carDeliveryData.locationInfo.timeZoneId,
        };

        const pickupLocationInfo: ContractLocationInfo = searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
          ? carLocationInfo
          : {
              userAddress: searchCarRequest.deliveryInfo.pickupLocation.locationInfo.address,
              country: searchCarRequest.deliveryInfo.pickupLocation.locationInfo.country,
              state: searchCarRequest.deliveryInfo.pickupLocation.locationInfo.state,
              city: searchCarRequest.deliveryInfo.pickupLocation.locationInfo.city,
              latitude: searchCarRequest.deliveryInfo.pickupLocation.locationInfo.latitude.toFixed(6),
              longitude: searchCarRequest.deliveryInfo.pickupLocation.locationInfo.longitude.toFixed(6),
              timeZoneId: searchCarRequest.deliveryInfo.pickupLocation.locationInfo.timeZoneId,
            };
        const returnLocationInfo = searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
          ? carLocationInfo
          : {
              userAddress: searchCarRequest.deliveryInfo.returnLocation.locationInfo.address,
              country: searchCarRequest.deliveryInfo.returnLocation.locationInfo.country,
              state: searchCarRequest.deliveryInfo.returnLocation.locationInfo.state,
              city: searchCarRequest.deliveryInfo.returnLocation.locationInfo.city,
              latitude: searchCarRequest.deliveryInfo.returnLocation.locationInfo.latitude.toFixed(6),
              longitude: searchCarRequest.deliveryInfo.returnLocation.locationInfo.longitude.toFixed(6),
              timeZoneId: searchCarRequest.deliveryInfo.returnLocation.locationInfo.timeZoneId,
            };

        const paymentsNeeded = await rentalityContract.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS,
          pickupLocationInfo,
          returnLocationInfo
        );

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
          pickUpInfo: {
            locationInfo: pickupLocationInfo,
            signature: "",
          },
          returnInfo: {
            locationInfo: returnLocationInfo,
            signature: "",
          },
        };

        const transaction = await rentalityContract.createTripRequestWithDelivery(tripRequest, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      } else {
        const paymentsNeeded = await rentalityContract.calculatePayments(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS
        );

        const tripRequest: ContractCreateTripRequest = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
        };

        const transaction = await rentalityContract.createTripRequest(tripRequest, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      }

      return true;
    } catch (e) {
      console.error("createTripRequest error:" + e);
      return false;
    }
  };

  function sortByDailyPriceAsc(a: SearchCarInfo, b: SearchCarInfo) {
    return a.pricePerDay - b.pricePerDay;
  }
  function sortByDailyPriceDes(a: SearchCarInfo, b: SearchCarInfo) {
    return b.pricePerDay - a.pricePerDay;
  }

  function sortByIncludedDistance(a: SearchCarInfo, b: SearchCarInfo) {
    return Number(a.milesIncludedPerDay) - Number(b.milesIncludedPerDay);
  }

  const sortSearchResult = useCallback((sortBy: SortOptionKey) => {
    const sortLogic =
      sortBy === "distance"
        ? sortByIncludedDistance
        : sortBy === "priceDesc"
          ? sortByDailyPriceDes
          : sortByDailyPriceAsc;

    setSearchResult((current) => {
      return {
        searchCarRequest: current.searchCarRequest,
        //TODO carInfos: current.carInfos.toSorted(sortLogic),
        carInfos: [...current.carInfos].sort(sortLogic),
      };
    });
  }, []);
  return [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest, setSearchResult] as const;
};

export default useSearchCars;
