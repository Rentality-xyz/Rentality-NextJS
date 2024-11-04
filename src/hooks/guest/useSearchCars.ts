import { useCallback, useState } from "react";
import { SearchCarInfo, SearchCarInfoDTO, SearchCarsResult, emptySearchCarsResult } from "@/model/SearchCarsResult";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";

export type SortOptions = {
  [key: string]: string;
};
export type SortOptionKey = keyof SortOptions;

const useSearchCars = () => {
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [searchResult, setSearchResult] = useState<SearchCarsResult>(emptySearchCarsResult);

  const searchAvailableCars = async (request: SearchCarRequest, filters: SearchCarFilters) => {
    try {
      setIsLoading(true);

      var url = new URL(`/api/publicSearchCars`, window.location.origin);
      if (ethereumInfo?.chainId) url.searchParams.append("chainId", ethereumInfo.chainId.toString());
      if (request.dateFrom) url.searchParams.append("dateFrom", request.dateFrom.toISOString());
      if (request.dateTo) url.searchParams.append("dateTo", request.dateTo.toISOString());
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

      const availableCarsData = apiJson as SearchCarInfoDTO[];

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
        carInfos: availableCarsData.map((i) => ({ ...i, engineType: BigInt(i.engineType) })),
      });
      return true;
    } catch (e) {
      console.error("updateData error:" + e);
      return false;
    } finally {
      setIsLoading(false);
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
        searchCarFilters: current.searchCarFilters,
        //TODO carInfos: current.carInfos.toSorted(sortLogic),
        carInfos: [...current.carInfos].sort(sortLogic),
      };
    });
  }, []);
  return [isLoading, searchAvailableCars, searchResult, sortSearchResult, setSearchResult] as const;
};

export default useSearchCars;
