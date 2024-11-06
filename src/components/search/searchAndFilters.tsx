import { isEmpty } from "@/utils/string";
import RntButton from "../common/rntButton";
import RntInput from "../common/rntInput";
import RntPlaceAutoComplete from "../common/rntPlaceAutocomplete";
import RntSelect from "../common/rntSelect";
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
import { formatLocationInfoUpToCity } from "@/model/LocationInfo";
import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { placeDetailsToLocationInfo } from "@/utils/location";
import RntCarMakeSelect from "@/components/common/rntCarMakeSelect";
import RntCarModelSelect from "@/components/common/rntCarModelSelect";
import { SortOptionKey, SortOptions } from "@/hooks/guest/useSearchCars";
import icLocation from "../../images/ic_location.png";
import icSearch from "@/images/ic_search.svg";
import icCalendar from "../../images/ic_calendar.png";
import PanelFilteringByYear from "@/components/search/panelFilteringByYear";
import PanelFilteringByPrice from "@/components/search/panelFilteringByPrice";

export default function SearchAndFilters({
  initValue,
  sortBy,
  setSortBy,
  onSearchClick,
  onFilterApply,
  t,
}: {
  initValue: SearchCarRequest;
  sortBy: string | undefined;
  setSortBy: (value: string | undefined) => void;
  onSearchClick: (searchCarRequest: SearchCarRequest) => Promise<void>;
  onFilterApply: (filters: SearchCarFilters) => Promise<void>;
  t: TFunctionNext;
}) {
  const [timeZoneId, setTimeZoneId] = useState("");
  const [searchCarRequest, setSearchCarRequest] = useState<SearchCarRequest>(initValue);

  const gmtLabel = isEmpty(timeZoneId) ? "" : `(GMT${moment.tz(timeZoneId).format("Z").slice(0, 3)})`;
  const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;
  const isSearchAllowed =
    formatLocationInfoUpToCity(searchCarRequest.searchLocation).length > 0 &&
    moment.tz(searchCarRequest.dateFromInDateTimeStringFormat, notEmtpyTimeZoneId) >= moment.tz(notEmtpyTimeZoneId) &&
    new Date(searchCarRequest.dateToInDateTimeStringFormat) > new Date(searchCarRequest.dateFromInDateTimeStringFormat);

  const t_comp = (element: string) => {
    return t("search_and_filters." + element);
  };

  const sortOption: Record<string, string> = t("search_and_filters.sort_options", {
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

  useEffect(() => {
    setSearchCarRequest(initValue);
  }, [initValue]);

  const [selectedModelID, setSelectedModelID] = useState<string>("");
  const [searchCarFilters, setSearchCarFilters] = useState<SearchCarFilters | null>(null);
  const [selectedMakeID, setSelectedMakeID] = useState<string>("");

  useEffect(() => {
    if (searchCarFilters) {
      onFilterApply(searchCarFilters);
    }
  }, [searchCarFilters]);

  function handleSearchClick() {
    onSearchClick(searchCarRequest);
  }

  function handleResetClick() {
    setSearchCarFilters({});
    setResetFilters(true);
    setSortBy("");
  }

  const [resetFilters, setResetFilters] = useState(false);

  return (
    <>
      <div className="search mb-2 mt-1 flex flex-col gap-4 xl:flex-row xl:items-end">
        <RntPlaceAutoComplete
          isTransparentStyle={true}
          iconFrontLabel={icLocation}
          className="w-full"
          inputClassName="mt-1 z-10"
          labelClassName="pl-3.5 font-bold"
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
            isTransparentStyle={true}
            iconFrontLabel={icCalendar}
            className="basis-1/2"
            inputClassName="pr-4 z-10"
            labelClassName="pl-[18px] z-10 font-bold"
            id="dateFrom"
            label={`${t_comp("datetime_from")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateFromInDateTimeStringFormat}
            onChange={handleSearchInputChange}
          />
          <RntInput
            isTransparentStyle={true}
            iconFrontLabel={icCalendar}
            className="basis-1/2"
            inputClassName="pr-4 z-10"
            labelClassName="pl-[18px] z-10 font-bold"
            id="dateTo"
            label={`${t_comp("datetime_to")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateToInDateTimeStringFormat}
            onChange={handleSearchInputChange}
          />
          <RntButton
            className="mt-2 flex w-full items-center justify-center md:w-48"
            disabled={!isSearchAllowed}
            onClick={handleSearchClick}
          >
            <Image src={icSearch} alt="" className="mr-2 h-[16px]" />
            {t_comp("button_search")}
          </RntButton>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="select-container w-full sm:w-48">
            <RntCarMakeSelect
              id={t_comp("select_filter_make")}
              className="border-gradient text-lg"
              selectClassName="bg-transparent text-rentality-secondary text-center custom-select px-4 border-0 cursor-pointer"
              promptText={t_comp("select_filter_make")}
              label=""
              value={searchCarFilters?.brand ?? ""}
              onMakeSelect={(newID, newMake) => {
                setSelectedMakeID(newID);
                setSearchCarFilters({
                  ...searchCarFilters,
                  brand: newMake,
                });
              }}
            />
            <span className="custom-arrow bg-[url('../images/arrowDownTurquoise.svg')]"></span>
          </div>

          <div className="select-container w-full sm:w-48">
            <RntCarModelSelect
              id={t_comp("select_filter_model")}
              className="border-gradient text-lg"
              selectClassName="bg-transparent text-rentality-secondary text-center custom-select px-4 border-0 cursor-pointer"
              promptText={t_comp("select_filter_model")}
              label=""
              value={searchCarFilters?.model ?? ""}
              make_id={selectedMakeID}
              onModelSelect={(newID, newModel) => {
                setSelectedModelID(newID);
                setSearchCarFilters({
                  ...searchCarFilters,
                  model: newModel,
                });
              }}
            />
            <span className="custom-arrow bg-[url('../images/arrowDownTurquoise.svg')]"></span>
          </div>

          <PanelFilteringByYear
            id={"panel-filtering-year"}
            onClickReset={() => {
              setSearchCarFilters({
                ...searchCarFilters,
                yearOfProductionFrom: 0,
                yearOfProductionTo: 0,
              });
            }}
            onClickApply={(selectedValues) => {
              setSearchCarFilters({
                ...searchCarFilters,
                yearOfProductionFrom: selectedValues[0],
                yearOfProductionTo: selectedValues[1],
              });
              setResetFilters(false);
            }}
            isResetFilters={resetFilters}
          />

          <PanelFilteringByPrice
            id={"panel-filtering-price"}
            onClickReset={() => {
              setSearchCarFilters({
                ...searchCarFilters,
                pricePerDayInUsdFrom: 0,
                pricePerDayInUsdTo: 0,
              });
            }}
            onClickApply={(selectedValues) => {
              setSearchCarFilters({
                ...searchCarFilters,
                pricePerDayInUsdFrom: selectedValues[0],
                pricePerDayInUsdTo: selectedValues[1],
              });
              setResetFilters(false);
            }}
            isResetFilters={resetFilters}
          />

          <div className="flex justify-between gap-4 max-sm:w-full">
            <RntButton className="w-40" onClick={handleResetClick}>
              {t_comp("button_reset_filters")}
            </RntButton>

            <div className="select-container">
              <RntSelect
                className="w-40 text-lg"
                selectClassName="buttonGradient text-white text-center custom-select px-4 border-0 cursor-pointer"
                id="sort"
                readOnly={false}
                value={sortBy ? sortOption[sortBy] : ""}
                onChange={(e) => {
                  const newDataKey = e.target.options[e.target.selectedIndex].getAttribute("data-key") || "";
                  if (isSortOptionKey(newDataKey)) {
                    setSortBy(newDataKey);
                  }
                }}
              >
                <option className="hidden" value="" disabled>
                  {t_comp("sort_by")}
                </option>
                {Object.entries(sortOption ?? {}).map(([key, value]) => (
                  <option key={key} value={value} data-key={key}>
                    {value}
                  </option>
                ))}
              </RntSelect>
              <span className="custom-arrow bg-[url('../images/arrowDownWhite.svg')]"></span>
            </div>
          </div>

          <RntButtonTransparent className="w-full sm:w-48" onClick={handleClickOpenDeliveryLocation}>
            <div className="relative flex items-center justify-center text-rentality-secondary">
              <div className="text-lg">{t_comp("button_deliver_to_me")}</div>
              <Image
                src={openDeliveryLocation ? arrowUpTurquoise : arrowDownTurquoise}
                alt=""
                className="max-sm:absolute max-sm:right-4 sm:ml-3"
              />
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
