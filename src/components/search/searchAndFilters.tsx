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
import Checkbox from "../common/checkbox";

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
    formatLocation(
      searchCarRequest.searchLocation.city,
      searchCarRequest.searchLocation.state,
      searchCarRequest.searchLocation.country
    ).length > 0 &&
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
      const address = formatLocation(
        searchCarRequest.searchLocation.city,
        searchCarRequest.searchLocation.state,
        searchCarRequest.searchLocation.country
      );
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
  }, [
    searchCarRequest.searchLocation.city,
    searchCarRequest.searchLocation.state,
    searchCarRequest.searchLocation.country,
  ]);

  return (
    <>
      <div className="search my-2 flex flex-col xl:flex-row gap-4 xl:items-end">
        <RntPlaceAutoComplete
          className="xl:w-1/2"
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
                locationLat: locationLat,
                locationLng: locationLng,
              },
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
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <Checkbox
          className=""
          title="Deliver to me"
          value={searchCarRequest.isDeliveryToGuest}
          onChange={(e) =>
            setSearchCarRequest({
              ...searchCarRequest,
              isDeliveryToGuest: e.target.checked,
            })
          }
        />
        <div className="flex flex-col gap-2">
          <RntPlaceAutoComplete
            className="min-w-[40ch]"
            id="pickupLocation"
            label="Pick up location"
            placeholder="Enter address"
            includeStreetAddress={true}
            readOnly={
              !searchCarRequest.isDeliveryToGuest || searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
            }
            initValue={
              !searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
                ? searchCarRequest.deliveryInfo.pickupLocation.address
                : ""
            }
            onAddressChange={async (placeDetails) => {
              if (
                !searchCarRequest.isDeliveryToGuest ||
                searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation
              )
                return;

              const locationLat = placeDetails.location?.latitude ?? 0;
              const locationLng = placeDetails.location?.longitude ?? 0;

              setSearchCarRequest({
                ...searchCarRequest,
                deliveryInfo: {
                  ...searchCarRequest.deliveryInfo,
                  pickupLocation: {
                    isHostHomeLocation: false,
                    address: placeDetails.addressString,
                    lat: locationLat,
                    lng: locationLng,
                  },
                },
              });
            }}
          />
          <Checkbox
            className=""
            title="Host home location"
            value={searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation}
            readOnly={!searchCarRequest.isDeliveryToGuest}
            onChange={(e) =>
              setSearchCarRequest({
                ...searchCarRequest,
                deliveryInfo: {
                  ...searchCarRequest.deliveryInfo,
                  pickupLocation: e.target.checked
                    ? {
                        isHostHomeLocation: e.target.checked,
                      }
                    : {
                        isHostHomeLocation: e.target.checked,
                        address: "",
                        lat: 0,
                        lng: 0,
                      },
                },
              })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <RntPlaceAutoComplete
            className="min-w-[40ch]"
            id="returnLocation"
            label="Return location"
            placeholder="Enter address"
            includeStreetAddress={true}
            readOnly={
              !searchCarRequest.isDeliveryToGuest || searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
            }
            initValue={
              !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
                ? searchCarRequest.deliveryInfo.returnLocation.address
                : ""
            }
            onAddressChange={async (placeDetails) => {
              if (
                !searchCarRequest.isDeliveryToGuest ||
                searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
              )
                return;

              const locationLat = placeDetails.location?.latitude ?? 0;
              const locationLng = placeDetails.location?.longitude ?? 0;

              setSearchCarRequest({
                ...searchCarRequest,
                deliveryInfo: {
                  ...searchCarRequest.deliveryInfo,
                  returnLocation: {
                    isHostHomeLocation: false,
                    address: placeDetails.addressString,
                    lat: locationLat,
                    lng: locationLng,
                  },
                },
              });
            }}
          />
          <Checkbox
            className=""
            title="Host home location"
            value={searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation}
            readOnly={!searchCarRequest.isDeliveryToGuest}
            onChange={(e) =>
              setSearchCarRequest({
                ...searchCarRequest,
                deliveryInfo: {
                  ...searchCarRequest.deliveryInfo,
                  returnLocation: e.target.checked
                    ? {
                        isHostHomeLocation: e.target.checked,
                      }
                    : {
                        isHostHomeLocation: e.target.checked,
                        address: "",
                        lat: 0,
                        lng: 0,
                      },
                },
              })
            }
          />
        </div>
        <RntButton className="w-full md:w-40" disabled={!isSearchAllowed} onClick={() => handleSearchClick()}>
          {t_comp("button_search")}
        </RntButton>
      </div>
    </>
  );
}
