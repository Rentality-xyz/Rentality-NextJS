import { useMemo } from "react";
import { isEmpty } from "@/utils/string";
import { DEFAULT_SEARCH_DATE_FROM, DEFAULT_SEARCH_DATE_TO, DEFAULT_SEARCH_LOCATION } from "@/utils/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { emptyLocationInfo, LocationInfo } from "@/model/LocationInfo";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";

type SearchCarQueryParams = {
  address: string;
  from: string;
  to: string;
  isDelivery: boolean;
  pickUp?: string;
  dropOff?: string;

  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;

  carId?: number;
};

export default function useCarSearchParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const address = searchParams?.get("address") as SearchCarQueryParams["address"];
  const from = searchParams?.get("from") as SearchCarQueryParams["from"];
  const to = searchParams?.get("to") as SearchCarQueryParams["to"];
  const isDelivery = searchParams?.get("isDelivery") !== null && searchParams?.get("isDelivery") === "true";
  const pickUp = searchParams?.get("pickUp") as SearchCarQueryParams["pickUp"];
  const dropOff = searchParams?.get("dropOff") as SearchCarQueryParams["dropOff"];

  const brand = searchParams?.get("brand") as SearchCarQueryParams["brand"];
  const model = searchParams?.get("model") as SearchCarQueryParams["model"];
  const yearFrom = searchParams?.get("yearFrom") ? parseInt(searchParams.get("yearFrom") as string) : undefined;
  const yearTo = searchParams?.get("yearTo") ? parseInt(searchParams.get("yearTo") as string) : undefined;
  const priceFrom = searchParams?.get("priceFrom") ? parseInt(searchParams.get("priceFrom") as string) : undefined;
  const priceTo = searchParams?.get("priceTo") ? parseInt(searchParams?.get("priceTo") as string) : undefined;

  const carId = searchParams?.get("carId") ? parseInt(searchParams?.get("carId") as string) : undefined;

  const searchCarRequest: SearchCarRequest = useMemo(() => {
    return {
      searchLocation: paramAddressToLocationInfo(address, DEFAULT_SEARCH_LOCATION),
      dateFromInDateTimeStringFormat: !isEmpty(from) ? from : dateToHtmlDateTimeFormat(DEFAULT_SEARCH_DATE_FROM),
      dateToInDateTimeStringFormat: !isEmpty(to) ? to : dateToHtmlDateTimeFormat(DEFAULT_SEARCH_DATE_TO),
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
      carId: carId,
    };
  }, [brand, model, yearFrom, yearTo, priceFrom, priceTo, carId]);

  function updateSearchParams(request: SearchCarRequest, filters: SearchCarFilters) {
    const pageParams = "?" + createQueryString(request, filters);
    //router.push(pathname + pageParams, pathname + pageParams, { shallow: true, scroll: false });
    router.push(pathname + pageParams, { scroll: false });
  }

  return { searchCarRequest, searchCarFilters, updateSearchParams } as const;
}

export function createQueryString(request: SearchCarRequest, filters: SearchCarFilters, carId?: number) {
  const params = new URLSearchParams();

  if (request.searchLocation && !isEmpty(request.searchLocation.address)) {
    setParam(params, "address", locationInfoToParamAddress(request.searchLocation));
  }
  if (!isEmpty(request.dateFromInDateTimeStringFormat)) {
    setParam(params, "from", request.dateFromInDateTimeStringFormat);
  }
  if (!isEmpty(request.dateToInDateTimeStringFormat)) {
    setParam(params, "to", request.dateToInDateTimeStringFormat);
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
  if (filters.carId && filters.carId > 0) {
    setParam(params, "carId", filters.carId.toString());
  }

  return params.toString();
}

function setParam(params: URLSearchParams, key: keyof SearchCarQueryParams, value: string) {
  params.set(key, value);
}

function locationInfoToParamAddress(locationInfo: LocationInfo): string {
  return `${locationInfo.address},${locationInfo.city},${locationInfo.state},${locationInfo.country},${locationInfo.latitude.toFixed(6)},${locationInfo.longitude.toFixed(6)}`;
}

function paramAddressToLocationInfo(address: string, defaultValue: LocationInfo = emptyLocationInfo): LocationInfo {
  const locationParts = (address ?? "").split(",");
  return locationParts.length >= 6
    ? {
        ...emptyLocationInfo,
        address: locationParts.slice(0, locationParts.length - 5).join(","),
        city: locationParts[locationParts.length - 5],
        state: locationParts[locationParts.length - 4],
        country: locationParts[locationParts.length - 3],
        latitude: parseFloat(locationParts[locationParts.length - 2]),
        longitude: parseFloat(locationParts[locationParts.length - 1]),
      }
    : defaultValue;
}
