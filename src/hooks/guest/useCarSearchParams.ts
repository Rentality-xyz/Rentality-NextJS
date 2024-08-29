import { useMemo } from "react";
import moment from "moment";
import { isEmpty } from "@/utils/string";
import { DEFAULT_SEARCH_DATE_FROM, DEFAULT_SEARCH_DATE_TO, DEFAULT_SEARCH_LOCATION } from "@/utils/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { emptyLocationInfo, LocationInfo } from "@/model/LocationInfo";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";

type SearchCarQueryParams = {
  address: string;
  from: number;
  to: number;
  isDelivery: boolean;
  pickUp?: string;
  dropOff?: string;

  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
};

function setParam(params: URLSearchParams, key: keyof SearchCarQueryParams, value: string) {
  params.set(key, value);
}

function locationInfoToParamAddress(locationInfo: LocationInfo): string {
  return `${locationInfo.city},${locationInfo.state},${locationInfo.country}`;
}

function paramAddressToLocationInfo(address: string, defaultValue: LocationInfo = emptyLocationInfo): LocationInfo {
  const locationParts = (address ?? "").split(",");
  return locationParts.length === 3
    ? {
        ...emptyLocationInfo,
        address: address,
        city: locationParts[0],
        state: locationParts[1],
        country: locationParts[2],
      }
    : defaultValue;
}

export function useCarSearchParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const address = searchParams.get("address") as SearchCarQueryParams["address"];
  const from = searchParams.get("from") ? parseInt(searchParams.get("from") as string) : undefined;
  const to = searchParams.get("to") ? parseInt(searchParams.get("to") as string) : undefined;
  const isDelivery = searchParams.get("isDelivery") !== null && searchParams.get("isDelivery") === "true";
  const pickUp = searchParams.get("pickUp") as SearchCarQueryParams["pickUp"];
  const dropOff = searchParams.get("dropOff") as SearchCarQueryParams["dropOff"];

  const brand = searchParams.get("brand") as SearchCarQueryParams["brand"];
  const model = searchParams.get("model") as SearchCarQueryParams["model"];
  const yearFrom = searchParams.get("yearFrom") ? parseInt(searchParams.get("yearFrom") as string) : undefined;
  const yearTo = searchParams.get("yearTo") ? parseInt(searchParams.get("yearTo") as string) : undefined;
  const priceFrom = searchParams.get("priceFrom") ? parseInt(searchParams.get("priceFrom") as string) : undefined;
  const priceTo = searchParams.get("priceTo") ? parseInt(searchParams.get("priceTo") as string) : undefined;

  const createQueryString = (request: SearchCarRequest, filters: SearchCarFilters) => {
    const params = new URLSearchParams();

    if (request.searchLocation && !isEmpty(request.searchLocation.address)) {
      setParam(params, "address", locationInfoToParamAddress(request.searchLocation));
    }
    if (request.dateFrom.getTime() > 0) {
      setParam(params, "from", moment(request.dateFrom).unix().toString());
    }
    if (request.dateTo.getTime() > 0) {
      setParam(params, "to", moment(request.dateTo).unix().toString());
    }
    if (request.isDeliveryToGuest) {
      setParam(params, "isDelivery", request.isDeliveryToGuest.toString());

      if (
        !request.deliveryInfo.pickupLocation.isHostHomeLocation &&
        !isEmpty(request.deliveryInfo.pickupLocation.locationInfo.address)
      ) {
        setParam(params, "pickUp", locationInfoToParamAddress(request.deliveryInfo.pickupLocation.locationInfo));
      }

      if (
        !request.deliveryInfo.returnLocation.isHostHomeLocation &&
        !isEmpty(request.deliveryInfo.returnLocation.locationInfo.address)
      ) {
        setParam(params, "dropOff", locationInfoToParamAddress(request.deliveryInfo.returnLocation.locationInfo));
      }
    }

    if (filters.brand && !isEmpty(filters.brand)) {
      setParam(params, "brand", filters.brand);
    }
    if (filters.model && !isEmpty(filters.model)) {
      setParam(params, "model", filters.model);
    }
    if (filters.yearOfProductionFrom && filters.yearOfProductionFrom > 0) {
      setParam(params, "yearFrom", filters.yearOfProductionFrom.toString());
    }
    if (filters.yearOfProductionTo && filters.yearOfProductionTo > 0) {
      setParam(params, "yearTo", filters.yearOfProductionTo.toString());
    }
    if (filters.pricePerDayInUsdFrom && filters.pricePerDayInUsdFrom > 0) {
      setParam(params, "priceFrom", filters.pricePerDayInUsdFrom.toString());
    }
    if (filters.pricePerDayInUsdTo && filters.pricePerDayInUsdTo > 0) {
      setParam(params, "priceTo", filters.pricePerDayInUsdTo.toString());
    }

    return params.toString();
  };

  const searchCarRequest: SearchCarRequest = useMemo(() => {
    return {
      searchLocation: paramAddressToLocationInfo(address, DEFAULT_SEARCH_LOCATION),
      dateFrom: from ? moment.unix(from).toDate() : DEFAULT_SEARCH_DATE_FROM,
      dateTo: to ? moment.unix(to).toDate() : DEFAULT_SEARCH_DATE_TO,
      isDeliveryToGuest: isDelivery,
      deliveryInfo: {
        pickupLocation:
          pickUp && !isEmpty(pickUp)
            ? { isHostHomeLocation: false, locationInfo: paramAddressToLocationInfo(pickUp) }
            : { isHostHomeLocation: true },
        returnLocation:
          dropOff && !isEmpty(dropOff)
            ? { isHostHomeLocation: false, locationInfo: paramAddressToLocationInfo(dropOff) }
            : { isHostHomeLocation: true },
      },
    };
  }, [address, from, to, isDelivery, pickUp, dropOff]);

  const searchCarFilters: SearchCarFilters = useMemo(() => {
    return {
      brand: brand,
      model: model,
      yearOfProductionFrom: yearFrom,
      yearOfProductionTo: yearTo,
      pricePerDayInUsdFrom: priceFrom,
      pricePerDayInUsdTo: priceTo,
    };
  }, [brand, model, yearFrom, yearTo, priceFrom, priceTo]);

  function updateSearchParams(request: SearchCarRequest, filters: SearchCarFilters) {
    const pageParams = "?" + createQueryString(request, filters);
    //router.push(pathname + pageParams, pathname + pageParams, { shallow: true, scroll: false });
    router.push(pathname + pageParams, { scroll: false });
  }

  return { searchCarRequest, searchCarFilters, updateSearchParams } as const;
}

export default useCarSearchParams;
