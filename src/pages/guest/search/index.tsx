import GuestLayout from "@/components/guest/layout/guestLayout";
import CarSearchItem from "@/components/guest/carSearchItem";
import useSearchCars, { SortOptionKey, isSortOptionKey, sortOptions } from "@/hooks/guest/useSearchCars";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import { calculateDays } from "@/utils/date";
import PageTitle from "@/components/pageTitle/pageTitle";
import SlidingPanel from "react-sliding-side-panel";
import { SearchCarRequest, emptySearchCarRequest } from "@/model/SearchCarRequest";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import RntDialogs from "@/components/common/rntDialogs";
import useRntDialogs from "@/hooks/useRntDialogs";
import { useUserInfo } from "@/contexts/userInfoContext";
import { isEmpty } from "@/utils/string";
import { Button } from "@mui/material";
import RntSelect from "@/components/common/rntSelect";
import RntPlaceAutocomplete from "@/components/common/rntPlaceAutocomplete";
import { getBlockchainTimeFromDate } from "@/utils/formInput";

export default function Search() {
  const dateNow = new Date();
  const defaultDateFrom = new Date(dateNow.getTime() + 1 * 60 * 60 * 1000); //dateNow + 1 hour
  const defaultDateTo = new Date(dateNow.getTime() + 25 * 60 * 60 * 1000); //dateNow + 1 day and 1 hour
  const customEmptySearchCarRequest: SearchCarRequest = {
    ...emptySearchCarRequest,
    city: "Miami",
    dateFrom: dateToHtmlDateTimeFormat(defaultDateFrom),
    dateTo: dateToHtmlDateTimeFormat(defaultDateTo),
  };

  const [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest] = useSearchCars();
  const [searchCarRequest, setSearchCarRequest] = useState<SearchCarRequest>(customEmptySearchCarRequest);
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [openFilterPanel, setOpenFilterPanel] = useState(false);
  const [searchButtonDisabled, setSearchButtonDisabled] = useState<boolean>(false);
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const [sortBy, setSortBy] = useState<SortOptionKey | undefined>(undefined);
  const userInfo = useUserInfo();
  const router = useRouter();

  const handleSearchClick = async () => {
    const result = await searchAvailableCars(searchCarRequest);
    if (result) {
      setSortBy(undefined);
    }
  };

  const handleRentCarRequest = async (carInfo: SearchCarInfo) => {
    try {
      if (isEmpty(userInfo.drivingLicense)) {
        const action = (
          <>
            <Button
              color="secondary"
              size="small"
              onClick={() => {
                router.push("/guest/profile");
              }}
            >
              My profile
            </Button>
          </>
        );
        showError("In order to rent a car, please enter user information", action);
        return;
      }

      if (searchResult.searchCarRequest.dateFrom == null) {
        showError("Please enter 'Date from'");
        return;
      }
      if (searchResult.searchCarRequest.dateTo == null) {
        showError("Please enter 'Date to'");
        return;
      }
      const startDateTime = new Date(searchResult.searchCarRequest.dateFrom);
      const endDateTime = new Date(searchResult.searchCarRequest.dateTo);

      const days = calculateDays(startDateTime, endDateTime);
      if (days < 0) {
        showError("'Date to' must be greater than 'Date from'");
        return;
      }
      setRequestSending(true);

      const totalPriceInUsdCents = carInfo.pricePerDay * 100 * days;
      const depositInUsdCents = carInfo.securityDeposit * 100;
      const location = `${searchResult.searchCarRequest.city}, ${searchResult.searchCarRequest.state}, ${searchResult.searchCarRequest.country}`;

      showInfo("Please confirm the transaction with your wallet and wait for the transaction to be processed");
      const result = await createTripRequest(
        carInfo.carId,
        carInfo.ownerAddress,
        startDateTime,
        endDateTime,
        location,
        location,
        totalPriceInUsdCents,
        0,
        depositInUsdCents
      );

      setRequestSending(false);
      hideSnackbar();
      if (!result) {
        showError("Your create trip request failed. Please make sure you entered trip details right and try again");
        return;
      }
      router.push("/guest/trips");
    } catch (e) {
      showError("Your create trip request failed. Please make sure you entered trip details right and try again");
      console.error("sendRentCarRequest error:" + e);

      setRequestSending(false);
    }
  };

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

  useEffect(() => {
    const isDataValid =
      formatLocation?.length > 0 &&
      new Date(searchCarRequest.dateFrom) >= new Date() &&
      new Date(searchCarRequest.dateTo) > new Date(searchCarRequest.dateFrom);
    setSearchButtonDisabled(!isDataValid);
  }, [searchCarRequest]);

  useEffect(() => {
    if (sortBy === undefined) return;
    sortSearchResult(sortBy);
  }, [sortBy, sortSearchResult]);

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Search" />
        <div className="search my-2 flex max-xl:flex-col gap-2 xl:items-end">
          {/* <RntInput
            className="xl:w-1/2"
            id="location"
            label="Pick up & Return Location"
            value={formatLocation(
              searchCarRequest.city,
              searchCarRequest.state,
              searchCarRequest.country
            )}
            onChange={handleSearchInputChange}
          /> */}
          <RntPlaceAutocomplete
            className="xl:w-1/2"
            id="location"
            label="Pick up & Return Location"
            placeholder="Miami"
            initValue={formatLocation(searchCarRequest.city, searchCarRequest.state, searchCarRequest.country)}
            onChange={handleSearchInputChange}
            onAddressChange={(placeDetails) => {
              const country = placeDetails.country?.short_name ?? "";
              const state = placeDetails.state?.long_name ?? "";
              const city = placeDetails.city?.long_name ?? "";

              setSearchCarRequest({
                ...searchCarRequest,
                country: country,
                state: state,
                city: city,
              });
            }}
          />
          <div className="flex max-md:flex-col md:items-end md:justify-between xl:justify-around w-full">
            <RntInput
              className="md:w-1/3 2xl:w-[38%]"
              id="dateFrom"
              label="From"
              type="datetime-local"
              value={searchCarRequest.dateFrom}
              onChange={handleSearchInputChange}
            />
            <RntInput
              className="md:w-1/3 2xl:w-[38%]"
              id="dateTo"
              label="To"
              type="datetime-local"
              value={searchCarRequest.dateTo}
              onChange={handleSearchInputChange}
            />

            <RntButton
              className="w-full sm:w-40 max-xl:mt-4"
              disabled={searchButtonDisabled}
              onClick={
                () => handleSearchClick()
                // showError("w-full sm:w-40 max-xl:mt-4")
              }
            >
              Search
            </RntButton>
          </div>
        </div>
        <div className="mt-2 flex flex-row gap-2 max-sm:justify-between">
          <RntButton className="w-40 " onClick={() => setOpenFilterPanel(true)}>
            Filters
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
            <option className="hidden" value={""} disabled>
              Sort by
            </option>
            {(Object.keys(sortOptions) as (keyof typeof sortOptions)[]).map((key) => (
              <option key={key} value={key}>
                {sortOptions[key]}
              </option>
            ))}
          </RntSelect>
        </div>
        <div className="mb-8 flex flex-row"></div>
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <>
            <div className="text-l font-bold">{searchResult?.carInfos?.length ?? 0} car(s) available</div>
            <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {searchResult?.carInfos != null && searchResult?.carInfos?.length > 0 ? (
                searchResult?.carInfos.map((value) => {
                  return (
                    <CarSearchItem
                      key={value.carId}
                      searchInfo={value}
                      handleRentCarRequest={handleRentCarRequest}
                      disableButton={requestSending}
                    />
                  );
                })
              ) : (
                <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                  No cars were found for your request
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="sliding-panel-container w-full fixed top-0 left-0">
        <SlidingPanel
          type={"left"}
          isOpen={openFilterPanel}
          size={50}
          noBackdrop={false}
          backdropClicked={() => setOpenFilterPanel(false)}
          panelContainerClassName="sliding-panel"
        >
          <div className="flex flex-col py-8">
            <div className="self-end mr-8">
              <i className="fi fi-br-cross" onClick={() => setOpenFilterPanel(false)}></i>
            </div>
            <div className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-4 md:px-8 lg:px-16 mt-4">
              <RntInput
                id="filter-brand"
                label="Car brand"
                value={searchCarRequest.brand}
                onChange={(e) =>
                  setSearchCarRequest({
                    ...searchCarRequest,
                    brand: e.target.value,
                  })
                }
              />
              <RntInput
                id="filter-model"
                label="Car model"
                value={searchCarRequest.model}
                onChange={(e) =>
                  setSearchCarRequest({
                    ...searchCarRequest,
                    model: e.target.value,
                  })
                }
              />
              <RntInput
                id="filter-year-from"
                label="Model year from"
                value={searchCarRequest.yearOfProductionFrom}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (isNaN(Number(newValue)) && newValue !== "") return;

                  setSearchCarRequest({
                    ...searchCarRequest,
                    yearOfProductionFrom: newValue,
                  });
                }}
              />
              <RntInput
                id="filter-year-yo"
                label="Model year to"
                value={searchCarRequest.yearOfProductionTo}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (isNaN(Number(newValue)) && newValue !== "") return;

                  setSearchCarRequest({
                    ...searchCarRequest,
                    yearOfProductionTo: newValue,
                  });
                }}
              />
              <RntInput
                id="filter-price-from"
                label="Price per day from"
                value={searchCarRequest.pricePerDayInUsdFrom}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (isNaN(Number(newValue)) && newValue !== "") return;
                  setSearchCarRequest({
                    ...searchCarRequest,
                    pricePerDayInUsdFrom: newValue,
                  });
                }}
              />
              <RntInput
                id="filter-price-yo"
                label="Price per day to"
                value={searchCarRequest.pricePerDayInUsdTo}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (isNaN(Number(newValue)) && newValue !== "") return;

                  setSearchCarRequest({
                    ...searchCarRequest,
                    pricePerDayInUsdTo: newValue,
                  });
                }}
              />
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 max-sm:mt-2 sm:justify-between">
                <RntButton
                  className="max-sm:h-10 max-sm:w-full"
                  onClick={() => {
                    setOpenFilterPanel(false);
                    handleSearchClick();
                  }}
                >
                  Apply
                </RntButton>
                <RntButton
                  className="max-sm:h-10 max-sm:w-full"
                  onClick={() => setSearchCarRequest(customEmptySearchCarRequest)}
                >
                  Reset
                </RntButton>
              </div>
            </div>
          </div>
        </SlidingPanel>
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </GuestLayout>
  );
}
