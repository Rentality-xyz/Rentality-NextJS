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
  const [utcOffset, setUtcOffset] = useState("");

  const gmtLabel = isEmpty(utcOffset) ? "" : `(GMT${utcOffset})`;
  const isSearchAllowed =
    formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country).length > 0 &&
    new Date(searchCarRequest.dateFrom) >= new Date() &&
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
      const address = formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country);
      if (isEmpty(address)) {
        setUtcOffset("");
        return;
      }

      var url = new URL(`/api/parseLocation`, window.location.origin);
      url.searchParams.append("address", address);
      const apiResponse = await fetch(url);

      if (!apiResponse.ok) {
        setUtcOffset("");
        return;
      }
      const apiJson = (await apiResponse.json()) as ParseLocationResponse;
      if ("error" in apiJson) {
        setUtcOffset("");
        return;
      }

      setUtcOffset(moment.tz(apiJson.timeZoneId).format("Z").slice(0, 3));
    };

    getGMTFromLocation();
  }, [searchCarRequest.city, searchCarRequest.state, searchCarRequest.country]);

  return (
    <>
      <div className="search my-2 flex flex-col xl:flex-row gap-4 xl:items-end">
        <RntPlaceAutoComplete
          className="xl:w-1/2"
          id="location"
          label={t_comp("location_label")}
          placeholder={t_comp("location_placeholder")}
          includeStreetAddress={true}
          initValue={formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country)}
          onChange={handleSearchInputChange}
          onAddressChange={async (placeDetails) => {
            const country = placeDetails.country?.short_name ?? "";
            const state = placeDetails.state?.long_name ?? "";
            const city = placeDetails.city?.long_name ?? "";
            const locationLat = placeDetails.location?.latitude;
            const locationLng = placeDetails.location?.longitude;

            setSearchCarRequest({
              ...searchCarRequest,
              country: country,
              state: state,
              city: city,
              locationLat: locationLat,
              locationLng: locationLng,
            });
          }}
        />
        <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between xl:justify-around">
          <RntInput
            className="basis-1/2"
            id="dateFrom"
            label={`${t_comp("datetime_from")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateFrom}
            onChange={handleSearchInputChange}
          />
          <RntInput
            className="basis-1/2"
            id="dateTo"
            label={`${t_comp("datetime_to")} ${gmtLabel}`}
            type="datetime-local"
            value={searchCarRequest.dateTo}
            onChange={handleSearchInputChange}
          />{" "}
          <RntButton className="w-full md:w-40" disabled={!isSearchAllowed} onClick={() => handleSearchClick()}>
            {t_comp("button_search")}
          </RntButton>
        </div>
      </div>
      <div className="mt-2 flex flex-row gap-2 justify-between md:justify-start">
        <RntButton className="w-40 " onClick={() => setOpenFilterPanel(true)}>
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
      </div>
    </>
  );
}
