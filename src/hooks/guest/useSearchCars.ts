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
} from "@/model/blockchain/schemas";
import { ethers } from "ethers";
import { bigIntReplacer } from "@/utils/json";
import { isEmpty } from "@/utils/string";

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
        !isEmpty(searchCarRequest.deliveryInfo.pickupLocation.address)
      )
        url.searchParams.append(
          "pickupLocation",
          `${searchCarRequest.deliveryInfo.pickupLocation.lat.toFixed(6)};${searchCarRequest.deliveryInfo.pickupLocation.lng.toFixed(6)}`
        );
      if (
        searchCarRequest.isDeliveryToGuest &&
        !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation &&
        !isEmpty(searchCarRequest.deliveryInfo.returnLocation.address)
      )
        url.searchParams.append(
          "returnLocation",
          `${searchCarRequest.deliveryInfo.returnLocation.lat.toFixed(6)};${searchCarRequest.deliveryInfo.returnLocation.lng.toFixed(6)}`
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

      const ethAddress = ethers.getAddress("0x0000000000000000000000000000000000000000");

      if (searchCarRequest.isDeliveryToGuest) {
        const deliveryData = await rentalityContract.getDeliveryData(BigInt(carId));
        const hostHomeLocationLat = deliveryData.locationLat;
        const hostHomeLocationLng = deliveryData.locationLon;

        const deliveryInfo: ContractDeliveryLocations = {
          pickUpLat: searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
            ? hostHomeLocationLat
            : searchCarRequest.deliveryInfo.pickupLocation.lat.toString(),
          pickUpLon: searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
            ? hostHomeLocationLng
            : searchCarRequest.deliveryInfo.pickupLocation.lng.toString(),
          returnLat: searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
            ? hostHomeLocationLat
            : searchCarRequest.deliveryInfo.returnLocation.lat.toString(),
          returnLon: searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
            ? hostHomeLocationLng
            : searchCarRequest.deliveryInfo.returnLocation.lng.toString(),
        };

        console.log(`deliveryInfo:${JSON.stringify(deliveryInfo, bigIntReplacer)}`);

        const paymentsNeeded = await rentalityContract.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ethAddress,
          deliveryInfo
        );

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ethAddress,
          deliveryInfo: deliveryInfo,
        };

        const transaction = await rentalityContract.createTripRequestWithDelivery(tripRequest, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      } else {
        const paymentsNeeded = await rentalityContract.calculatePayments(BigInt(carId), BigInt(days), ethAddress);

        const tripRequest: ContractCreateTripRequest = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ethAddress,
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
