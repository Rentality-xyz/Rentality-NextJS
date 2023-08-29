import GuestLayout from "@/components/guest/layout/guestLayout";
import CarSearchItem from "@/components/guest/carSearchItem";
import useAvailableCars from "@/hooks/guest/useAvailableCars";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import { calculateDays } from "@/utils/date";
import PageTitle from "@/components/pageTitle/pageTitle";
import SlidingPanel from "react-sliding-side-panel";
import {
  SearchCarRequest,
  emptySearchCarRequest,
} from "@/model/SearchCarRequest";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import RntDialogs from "@/components/common/rntDialogs";
import useRntDialogs from "@/hooks/useRntDialogs";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function Search() {
  const dateNow = new Date();
  const dateFrom = new Date(dateNow.getTime() + (1*60*60*1000)); //dateNow + 1 hour
  const dateTo = new Date(dateNow.getTime() + (25*60*60*1000));   //dateNow + 1 day and 1 hour
  const customEmptySearchCarRequest: SearchCarRequest = {
    ...emptySearchCarRequest,
    city: "Miami",
    dateFrom: dateToHtmlDateTimeFormat(dateFrom),
    dateTo: dateToHtmlDateTimeFormat(dateTo),
  };

  const [
    dataFetched,
    searchCarsResult,
    searchAvailableCars,
    dataSaved,
    createTripRequest,
  ] = useAvailableCars();
  const [searchCarRequest, setSearchCarRequest] = useState<SearchCarRequest>(
    customEmptySearchCarRequest
  );

  const [requestSending, setRequestSending] = useState<boolean>(false);
  const router = useRouter();
  const [openFilterPanel, setOpenFilterPanel] = useState(false);
  const [searchButtonDisabled, setSearchButtonDisabled] =
    useState<boolean>(false);
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();

  const searchCars = async () => {
    const startDateTime = new Date(searchCarRequest.dateFrom);
    const endDateTime = new Date(searchCarRequest.dateTo);
    let days = calculateDays(startDateTime, endDateTime);
    if (days < 0) {
      days = 0;
    }

    await searchAvailableCars(searchCarRequest);
  };

  const sendRentCarRequest = async (carInfo: SearchCarInfo) => {
    try {
      if (searchCarsResult.searchCarRequest.dateFrom == null) {
        showError("Please enter 'Date from'");
        return;
      }
      if (searchCarsResult.searchCarRequest.dateTo == null) {
        showError("Please enter 'Date to'");
        return;
      }
      const startDateTime = new Date(
        searchCarsResult.searchCarRequest.dateFrom
      );
      const endDateTime = new Date(searchCarsResult.searchCarRequest.dateTo);

      const days = calculateDays(startDateTime, endDateTime);
      if (days < 0) {
        showError("'Date to' must be greater than 'Date from'");
        return;
      }
      setRequestSending(true);

      const startUnixTime = startDateTime.getTime() / 1000;
      const endUnixTime = endDateTime.getTime() / 1000;
      const totalPriceInUsdCents = carInfo.pricePerDay * 100 * days;
      const depositInUsdCents = carInfo.securityDeposit * 100;
      const fuelPricePerGalInUsdCents = carInfo.fuelPricePerGal * 100;
      const location = `${searchCarsResult.searchCarRequest.city}, ${searchCarsResult.searchCarRequest.state}, ${searchCarsResult.searchCarRequest.country}`;

      showInfo(
        "Please confirm the transaction with your wallet and wait for the transaction to be processed"
      );
      const result = await createTripRequest(
        carInfo.carId,
        carInfo.ownerAddress,
        startUnixTime,
        endUnixTime,
        location,
        location,
        totalPriceInUsdCents,
        0,
        depositInUsdCents,
        fuelPricePerGalInUsdCents
      );

      setRequestSending(false);
      hideSnackbar();
      if (!result) {
        showError(
          "Your create trip request failed. Please make sure you entered trip details right and try again"
        );
        return;
      }
      router.push("/guest/trips");
    } catch (e) {
      showError(
        "Your create trip request failed. Please make sure you entered trip details right and try again"
      );
      console.error("sendRentCarRequest error:" + e);

      setRequestSending(false);
    }
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Search" />
        <div className="search my-2 flex flex-row gap-2 items-end">
          <RntInput
            className="w-1/2"
            id="location"
            label="Pick up & Return Location"
            value={formatLocation(
              searchCarRequest.city,
              searchCarRequest.state,
              searchCarRequest.country
            )}
            onChange={handleChange}
          />
          <RntInput
            className="w-1/4"
            id="dateFrom"
            label="From"
            type="datetime-local"
            value={searchCarRequest.dateFrom}
            onChange={handleChange}
          />
          <RntInput
            className="w-1/4"
            id="dateTo"
            label="To"
            type="datetime-local"
            value={searchCarRequest.dateTo}
            onChange={handleChange}
          />
          <RntButton
            className="w-40"
            disabled={searchButtonDisabled}
            onClick={() => searchCars()}
          >
            Search
          </RntButton>
        </div>
        <RntButton
          className="w-40 mt-2"
          onClick={() => setOpenFilterPanel(true)}
        >
          Filters
        </RntButton>
        <div className="mb-8 flex flex-row"></div>
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <>
            <div className="text-l font-bold">
              {searchCarsResult?.carInfos?.length ?? 0} car(s) available
            </div>
            <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {searchCarsResult?.carInfos != null &&
              searchCarsResult?.carInfos?.length > 0 ? (
                searchCarsResult?.carInfos.map((value) => {
                  return (
                    <CarSearchItem
                      key={value.carId}
                      searchInfo={value}
                      sendRentCarRequest={sendRentCarRequest}
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
          size={30}
          noBackdrop={false}
          backdropClicked={() => setOpenFilterPanel(false)}
          panelContainerClassName="sliding-panel"
        >
          <div className="flex flex-col py-8">
            <div className="self-end mr-8">
              <i
                className="fi fi-br-cross"
                onClick={() => setOpenFilterPanel(false)}
              ></i>
            </div>
            <div className="flex flex-col gap-4 px-16 mt-4">
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
              <div className="flex flex-row gap-8 justify-between">
                <RntButton
                  onClick={() => {
                    setOpenFilterPanel(false);
                    searchCars();
                  }}
                >
                  Apply
                </RntButton>
                <RntButton
                  onClick={() =>
                    setSearchCarRequest(customEmptySearchCarRequest)
                  }
                >
                  Reset filters
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
