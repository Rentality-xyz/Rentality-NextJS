import { useCallback, useState } from "react";
import { calculateDays, UTC_TIME_ZONE_ID } from "@/utils/date";
import { SearchCarInfo, SearchCarsResult, emptySearchCarsResult } from "@/model/SearchCarsResult";
import { useRentality } from "@/contexts/rentalityContext";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractCreateTripRequest,
  ContractCreateTripRequestWithDelivery,
  ContractLocationInfo,
} from "@/model/blockchain/schemas";
import { isEmpty } from "@/utils/string";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import moment from "moment";
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { formatEther } from "viem";
import { UNLIMITED_MILES_VALUE_TEXT } from "@/model/HostCarInfo";

export type SortOptions = {
  [key: string]: string;
};
export type SortOptionKey = keyof SortOptions;

const useSearchCars = () => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [searchResult, setSearchResult] = useState<SearchCarsResult>(emptySearchCarsResult);

  const searchAvailableCars = async (request: SearchCarRequest, filters: SearchCarFilters) => {
    try {
      setIsLoading(true);

      var url = new URL(`/api/publicSearchCars`, window.location.origin);
      if (ethereumInfo?.chainId) url.searchParams.append("chainId", ethereumInfo.chainId.toString());
      if (request.dateFromInDateTimeStringFormat)
        url.searchParams.append("dateFrom", request.dateFromInDateTimeStringFormat);
      if (request.dateToInDateTimeStringFormat) url.searchParams.append("dateTo", request.dateToInDateTimeStringFormat);
      if (request.searchLocation.country) url.searchParams.append("country", request.searchLocation.country);
      if (request.searchLocation.state) url.searchParams.append("state", request.searchLocation.state);
      if (request.searchLocation.city) url.searchParams.append("city", request.searchLocation.city);
      url.searchParams.append("latitude", request.searchLocation.latitude.toFixed(6));
      url.searchParams.append("longitude", request.searchLocation.longitude.toFixed(6));

      if (request.isDeliveryToGuest)
        url.searchParams.append("isDeliveryToGuest", request.isDeliveryToGuest ? "true" : "false");
      if (
        request.isDeliveryToGuest &&
        !request.deliveryInfo.pickupLocation.isHostHomeLocation &&
        !isEmpty(request.deliveryInfo.pickupLocation.locationInfo.address)
      )
        url.searchParams.append(
          "pickupLocation",
          `${request.deliveryInfo.pickupLocation.locationInfo.latitude.toFixed(6)};${request.deliveryInfo.pickupLocation.locationInfo.longitude.toFixed(6)}`
        );
      if (
        request.isDeliveryToGuest &&
        !request.deliveryInfo.returnLocation.isHostHomeLocation &&
        !isEmpty(request.deliveryInfo.returnLocation.locationInfo.address)
      )
        url.searchParams.append(
          "returnLocation",
          `${request.deliveryInfo.returnLocation.locationInfo.latitude.toFixed(6)};${request.deliveryInfo.returnLocation.locationInfo.longitude.toFixed(6)}`
        );

      if (filters.brand) url.searchParams.append("brand", filters.brand);
      if (filters.model) url.searchParams.append("model", filters.model);
      if (filters.yearOfProductionFrom)
        url.searchParams.append("yearOfProductionFrom", filters.yearOfProductionFrom.toString());
      if (filters.yearOfProductionTo)
        url.searchParams.append("yearOfProductionTo", filters.yearOfProductionTo.toString());
      if (filters.pricePerDayInUsdFrom)
        url.searchParams.append("pricePerDayInUsdFrom", filters.pricePerDayInUsdFrom.toString());
      if (filters.pricePerDayInUsdTo)
        url.searchParams.append("pricePerDayInUsdTo", filters.pricePerDayInUsdTo.toString());

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

      for (const carInfoI of availableCarsData) {
        for (const carInfoJ of availableCarsData) {
          if (
            carInfoI.carId == carInfoJ.carId &&
            carInfoJ.location.lat == carInfoJ.location.lat &&
            carInfoJ.location.lng == carInfoJ.location.lng
          ) {
            //update the position of the coincident marker by applying a small multipler to its coordinates
            carInfoI.location.lat += (Math.random() - 0.5) / 4000; // * (Math.random() * (max - min) + min);
            carInfoI.location.lng += (Math.random() - 0.5) / 4000; // * (Math.random() * (max - min) + min);
          }
        }
      }

      if (availableCarsData.length > 0) {
        availableCarsData[0].highlighted = true;
      }

      setSearchResult({
        searchCarRequest: request,
        searchCarFilters: filters,
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

  async function createTripRequest(
    carId: number,
    searchCarRequest: SearchCarRequest,
    timeZoneId: string
  ): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("createTripRequest error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContract) {
      console.error("createTripRequest error: rentalityContract is null");
      return Err("ERROR");
    }

    const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;
    const dateFrom = moment.tz(searchCarRequest.dateFromInDateTimeStringFormat, notEmtpyTimeZoneId).toDate();
    const dateTo = moment.tz(searchCarRequest.dateToInDateTimeStringFormat, notEmtpyTimeZoneId).toDate();

    const days = calculateDays(dateFrom, dateTo);
    if (days < 0) {
      console.error("Date to' must be greater than 'Date from'");
      return Err("ERROR");
    }
    const startUnixTime = getBlockchainTimeFromDate(dateFrom);
    const endUnixTime = getBlockchainTimeFromDate(dateTo);

    try {
      if (
        searchCarRequest.isDeliveryToGuest ||
        !searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation ||
        !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
      ) {
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

        const pickupLocationInfo: ContractLocationInfo =
          searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation ||
          isEmpty(searchCarRequest.deliveryInfo.pickupLocation.locationInfo.address)
            ? carLocationInfo
            : mapLocationInfoToContractLocationInfo(searchCarRequest.deliveryInfo.pickupLocation.locationInfo);
        const returnLocationInfo =
          searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation ||
          isEmpty(searchCarRequest.deliveryInfo.returnLocation.locationInfo.address)
            ? carLocationInfo
            : mapLocationInfoToContractLocationInfo(searchCarRequest.deliveryInfo.returnLocation.locationInfo);

        const paymentsNeeded = await rentalityContract.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS,
          pickupLocationInfo,
          returnLocationInfo
        );

        const pickupLocationResult = await getSignedLocationInfo(pickupLocationInfo, ethereumInfo.chainId);
        if (!pickupLocationResult.ok) {
          console.error("Sign location error");
          return Err("ERROR");
        }

        const returnLocationResult =
          returnLocationInfo.userAddress === pickupLocationInfo.userAddress
            ? pickupLocationResult
            : await getSignedLocationInfo(returnLocationInfo, ethereumInfo.chainId);
        if (!returnLocationResult.ok) {
          console.error("Sign location error");
          return Err("ERROR");
        }

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
          pickUpInfo: pickupLocationResult.value,
          returnInfo: returnLocationResult.value,
        };
        const totalPriceInEth = Number(formatEther(paymentsNeeded.totalPrice));

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer, totalPriceInEth))) {
          console.error("createTripRequest error: user don't have enough funds");
          return Err("NOT_ENOUGH_FUNDS");
        }

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

        const totalPriceInEth = Number(formatEther(paymentsNeeded.totalPrice));

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer, totalPriceInEth))) {
          console.error("createTripRequest error: user don't have enough funds");
          return Err("NOT_ENOUGH_FUNDS");
        }
        const transaction = await rentalityContract.createTripRequest(tripRequest, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      }

      return Ok(true);
    } catch (e) {
      console.error("createTripRequest error:" + e);
      return Err("ERROR");
    }
  }

  function sortByDailyPriceAsc(a: SearchCarInfo, b: SearchCarInfo) {
    return a.pricePerDay - b.pricePerDay;
  }
  function sortByDailyPriceDes(a: SearchCarInfo, b: SearchCarInfo) {
    return b.pricePerDay - a.pricePerDay;
  }

  function sortByIncludedDistance(a: SearchCarInfo, b: SearchCarInfo) {
    return (
      Number(
        b.milesIncludedPerDayText === UNLIMITED_MILES_VALUE_TEXT ? Number.POSITIVE_INFINITY : b.milesIncludedPerDayText
      ) -
      Number(
        a.milesIncludedPerDayText === UNLIMITED_MILES_VALUE_TEXT ? Number.POSITIVE_INFINITY : a.milesIncludedPerDayText
      )
    );
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
        searchCarFilters: current.searchCarFilters,
        //TODO carInfos: current.carInfos.toSorted(sortLogic),
        carInfos: [...current.carInfos].sort(sortLogic),
      };
    });
  }, []);
  return [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest, setSearchResult] as const;
};

export default useSearchCars;
