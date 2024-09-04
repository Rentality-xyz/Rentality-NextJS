import { isEmpty } from "@/utils/string";
import RntButton from "../common/rntButton";
import RntInput from "../common/rntInput";
import RntPlaceAutoComplete from "../common/rntPlaceAutocomplete";
import RntSelect from "../common/rntSelect";
import { SortOptionKey } from "@/hooks/guest/useSearchCars";
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
import { useAppContext } from "@/contexts/appContext";
import { formatLocationInfoUpToCity } from "@/model/LocationInfo";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import { placeDetailsToLocationInfo } from "@/utils/location";

export default function SearchAndFilters({
  initValue,
  sortBy,
  setSortBy,
  onSearchClick,
  onOpenFilters,
  t,
}: {
  initValue: SearchCarRequest;
  sortBy: string | undefined;
  setSortBy: (value: string | undefined) => void;
  onSearchClick: (searchCarRequest: SearchCarRequest) => Promise<void>;
  onOpenFilters: () => void;
  t: TFunctionNext;
}) {
  const [timeZoneId, setTimeZoneId] = useState("");
  const [searchCarRequest, setSearchCarRequest] = useState<SearchCarRequest>(initValue);

  const gmtLabel = isEmpty(timeZoneId) ? "" : `(GMT${moment.tz(timeZoneId).format("Z").slice(0, 3)})`;
  const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;
  const isSearchAllowed =
    formatLocationInfoUpToCity(searchCarRequest.searchLocation).length > 0 &&
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

  function handleSearchClick() {
    onSearchClick(searchCarRequest);
  }

  function handleFiltersClick() {
    onOpenFilters();
    openFilterOnSearchPage();
  }

  function handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const name = e.target.name;

    if (name === "location") {
      return;
    }
    if (name === "dateFrom" || name === "dateTo") {
      setSearchCarRequest({
        ...searchCarRequest,
        [name]: moment(value).toDate(),
      });
      return;
    }

    setSearchCarRequest({
      ...searchCarRequest,
      [name]: value,
    });
  }

  useEffect(() => {
    const getGMTFromLocation = async () => {
      const address = formatLocationInfoUpToCity(searchCarRequest.searchLocation);
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
  }, [searchCarRequest.searchLocation]);

  const [openDeliveryLocation, setOpenDeliveryLocation] = useState(false);

  const handleClickOpenDeliveryLocation = () => {
    setOpenDeliveryLocation(!openDeliveryLocation);
    setSearchCarRequest({
      ...searchCarRequest,
      isDeliveryToGuest: !openDeliveryLocation,
    });
  };

  const { openFilterOnSearchPage } = useAppContext();

  useEffect(() => {
    setSearchCarRequest(initValue);
  }, [initValue]);

  return (
    <>
      <div className="search my-2 flex flex-col gap-4 xl:flex-row xl:items-end">
        <RntPlaceAutoComplete
          className="xl:w-2/3"
          labelClassName="pl-[18px]"
          id="location"
          label={t_comp("location_label")}
          placeholder={t_comp("location_placeholder")}
          includeStreetAddress={true}
          initValue={formatLocationInfoUpToCity(searchCarRequest.searchLocation)}
          onChange={handleSearchInputChange}
          onAddressChange={async (placeDetails) => {
            setSearchCarRequest({
              ...searchCarRequest,
              searchLocation: placeDetailsToLocationInfo(placeDetails),
            });
          }}
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between xl:justify-around">
          <RntInput
            className="basis-1/2"
            inputClassName="pr-4"
            labelClassName="pl-[18px]"
            id="dateFrom"
            label={`${t_comp("datetime_from")} ${gmtLabel}`}
            type="datetime-local"
            value={dateToHtmlDateTimeFormat(searchCarRequest.dateFrom)}
            onChange={handleSearchInputChange}
          />
          <RntInput
            className="basis-1/2"
            inputClassName="pr-4"
            labelClassName="pl-[18px]"
            id="dateTo"
            label={`${t_comp("datetime_to")} ${gmtLabel}`}
            type="datetime-local"
            value={dateToHtmlDateTimeFormat(searchCarRequest.dateTo)}
            onChange={handleSearchInputChange}
          />{" "}
          <RntButton className="mt-2 w-full md:w-48" disabled={!isSearchAllowed} onClick={handleSearchClick}>
            {t_comp("button_search")}
          </RntButton>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <RntButton className="w-40" onClick={handleFiltersClick}>
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
            <div className="flex items-center justify-center text-[#52D1C9]">
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
