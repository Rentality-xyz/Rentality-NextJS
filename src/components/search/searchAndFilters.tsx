import { isEmpty } from "@/utils/string";
import RntButton from "../common/rntButton";
import RntInput from "../common/rntInput";
import RntPlaceAutoComplete from "../common/rntPlaceAutocomplete";
import RntSelect from "../common/rntSelect";
import { SortOptionKey } from "@/hooks/guest/useSearchCars";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { TFunction as TFunctionNext } from "i18next";
import { useEffect, useState } from "react";
import { ParseLocationResponse } from "@/pages/api/parseLocation";
import moment from "moment";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import * as React from "react";
import arrowUpTurquoise from "../../images/arrowUpTurquoise.svg";
import arrowDownTurquoise from "../../images/arrowDownTurquoise.svg";
import Image from "next/image";
import SearchDeliveryLocations from "@/components/search/searchDeliveryLocations";
import {useAppContext} from "@/contexts/appContext";

function formatLocation(city: string, state: string, country: string) {
  city = city != null && city.length > 0 ? city + ", " : "";
  state = state != null && state.length > 0 ? state + ", " : "";
  country = country != null && country.length > 0 ? country + ", " : "";
  const location = `${city}${state}${country}`;
  if (location.length > 2) {
    return location.slice(0, -2);
  }

  return location;
}

export default function SearchAndFilters({
  searchCarRequest,
  setSearchCarRequest,
  sortBy,
  setSortBy,
  handleSearchClick,
  setOpenFilterPanel,
  t,
}: {
  searchCarRequest: SearchCarRequest;
  setSearchCarRequest: (value: SearchCarRequest) => void;
  sortBy: string | undefined;
  setSortBy: (value: string | undefined) => void;
  handleSearchClick: () => Promise<void>;
  setOpenFilterPanel: (value: boolean) => void;
  t: TFunctionNext;
}) {
  const [timeZoneId, setTimeZoneId] = useState("");

  const gmtLabel = isEmpty(timeZoneId) ? "" : `(GMT${moment.tz(timeZoneId).format("Z").slice(0, 3)})`;
  const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;
  const isSearchAllowed =
    formatLocation(
      searchCarRequest.searchLocation.city,
      searchCarRequest.searchLocation.state,
      searchCarRequest.searchLocation.country
    ).length > 0 &&
    moment.tz(searchCarRequest.dateFrom, notEmtpyTimeZoneId) >= moment.tz(notEmtpyTimeZoneId) &&
    new Date(searchCarRequest.dateTo) > new Date(searchCarRequest.dateFrom);

  const t_comp = (element: string) => {
    return t("search_and_filters." + element);
  };

  const sortOption: object = t("search_and_filters.sort_options", {
    returnObjects: true,
  });

  function isSortOptionKey(key: PropertyKey): key is SortOptionKey {
    return sortOption.hasOwnProperty(key);
  }

  function handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const name = e.target.name;

    if (name === "location") {
      return;
    }

    setSearchCarRequest({
      ...searchCarRequest,
      [name]: value,
    });
  }

  useEffect(() => {
    const getGMTFromLocation = async () => {
      const address = formatLocation(
        searchCarRequest.searchLocation.city,
        searchCarRequest.searchLocation.state,
        searchCarRequest.searchLocation.country
      );
      if (isEmpty(address)) {
        setTimeZoneId("");
        return;
      }

      var url = new URL(`/api/parseLocation`, window.location.origin);
      url.searchParams.append("address", address);
      const apiResponse = await fetch(url);

      if (!apiResponse.ok) {
        setTimeZoneId("");
        return;
      }
      const apiJson = (await apiResponse.json()) as ParseLocationResponse;
      if ("error" in apiJson) {
        setTimeZoneId("");
        return;
      }

      setTimeZoneId(apiJson.timeZoneId);
    };

    getGMTFromLocation();
  }, [
    searchCarRequest.searchLocation.city,
    searchCarRequest.searchLocation.state,
    searchCarRequest.searchLocation.country,
  ]);

  const [openDeliveryLocation, setOpenDeliveryLocation] = useState(false);

  const handleClickOpenDeliveryLocation = () => {
    setOpenDeliveryLocation(!openDeliveryLocation);
    setSearchCarRequest({
      ...searchCarRequest,
      isDeliveryToGuest: !openDeliveryLocation,
    });
  };

  const { isHideFilterOnSearchPage, toggleFilterOnSearchPage } = useAppContext();

  return (
    <>
      <div className="search my-2 flex flex-col xl:flex-row gap-4 xl:items-end">
        <RntPlaceAutoComplete
          className="xl:w-2/3"
          id="location"
          label={t_comp("location_label")}
          placeholder={t_comp("location_placeholder")}
          includeStreetAddress={true}
          initValue={formatLocation(
            searchCarRequest.searchLocation.city,
            searchCarRequest.searchLocation.state,
            searchCarRequest.searchLocation.country
          )}
          onChange={handleSearchInputChange}
          onAddressChange={async (placeDetails) => {
            const country = placeDetails.country?.short_name ?? "";
            const state = placeDetails.state?.long_name ?? "";
            const city = placeDetails.city?.long_name ?? "";
            const locationLat = placeDetails.location?.latitude;
            const locationLng = placeDetails.location?.longitude;

            setSearchCarRequest({
              ...searchCarRequest,
              searchLocation: {
                address: placeDetails.addressString,
                country: country,
                state: state,
                city: city,
                latitude: locationLat ?? 0,
                longitude: locationLng ?? 0,
                timeZoneId: "",
              },
            });
          }}
        />
        <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between xl:justify-around">
          <RntInput
            className="basis-1/2"
            inputClassName="pr-4"
            id="dateFrom"
            label={`${t_comp("datetime_from")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateFrom}
            onChange={handleSearchInputChange}
          />
          <RntInput
            className="basis-1/2"
            inputClassName="pr-4"
            id="dateTo"
            label={`${t_comp("datetime_to")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateTo}
            onChange={handleSearchInputChange}
          />{" "}
          <RntButton className="w-full md:w-48 mt-2" disabled={!isSearchAllowed} onClick={() => handleSearchClick()}>
            {t_comp("button_search")}
          </RntButton>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <RntButton
              className="w-40 "
              onClick={() => {
                setOpenFilterPanel(true);
                toggleFilterOnSearchPage();
              }}
          >
            {t_comp("button_filter")}
          </RntButton>
          <RntSelect
            className="w-40"
            id="sort"
            readOnly={false}
            value={sortBy ?? ""}
            onChange={(e) => {
              const newValue = e.target.value;
              if (isSortOptionKey(newValue)) {
                setSortBy(newValue);
              }
            }}
          >
            <option className="hidden" value="" disabled>
              {t_comp("sort_by")}
            </option>
            {Object.entries(sortOption ?? {}).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </RntSelect>
          <RntButtonTransparent className="w-full sm:w-48" onClick={handleClickOpenDeliveryLocation}>
            <div className="flex justify-center items-center text-[#52D1C9]">
              <div className="text-lg">Deliver to me</div>
              <Image src={openDeliveryLocation ? arrowUpTurquoise : arrowDownTurquoise} alt="" className="ml-1" />
            </div>
          </RntButtonTransparent>
        </div>
        {openDeliveryLocation && (
          <div>
            <SearchDeliveryLocations searchCarRequest={searchCarRequest} setSearchCarRequest={setSearchCarRequest} />
          </div>
        )}
      </div>
    </>
  );
}
