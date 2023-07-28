import GuestLayout from "@/components/guest/layout/guestLayout";
import CarSearchItem from "@/components/guest/carSearchItem";
import useAvailableCars from "@/hooks/guest/useAvailableCars";
import { useRouter } from "next/router";
import { useState } from "react";
import { dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import { calculateDays } from "@/utils/date";
import PageTitle from "@/components/pageTitle/pageTitle";
import SlidingPanel from "react-sliding-side-panel";
import Button from "@/components/common/button";
import {
  SearchCarRequest,
  emptySearchCarRequest,
} from "@/model/SearchCarRequest";
import { SearchCarInfo } from "@/model/SearchCarsResult";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";

export default function Search() {
  const customEmptySearchCarRequest: SearchCarRequest = {
    ...emptySearchCarRequest,
    city: "Miami",
    dateFrom: dateToHtmlDateTimeFormat(new Date()),
    dateTo: dateToHtmlDateTimeFormat(new Date()),
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

  const searchCars = async () => {
    const startDateTime = new Date(searchCarRequest.dateFrom);
    const endDateTime = new Date(searchCarRequest.dateTo);
    let days = calculateDays(startDateTime, endDateTime) + 1;
    if (days < 0) {
      days = 0;
    }

    await searchAvailableCars(searchCarRequest);
  };

  const sendRentCarRequest = async (carInfo: SearchCarInfo) => {
    try {
      if (searchCarsResult.searchCarRequest.dateFrom == null) {
        alert("Please enter Date From");
        return;
      }
      if (searchCarsResult.searchCarRequest.dateTo == null) {
        alert("Please enter Date To");
        return;
      }
      const startDateTime = new Date(
        searchCarsResult.searchCarRequest.dateFrom
      );
      const endDateTime = new Date(searchCarsResult.searchCarRequest.dateTo);

      const days = calculateDays(startDateTime, endDateTime) + 1;
      if (days < 0) {
        alert("Date to must be greater than Date from");
        return;
      }
      setRequestSending(true);

      const startUnixTime = startDateTime.getTime() / 1000;
      const endUnixTime = endDateTime.getTime() / 1000;
      const totalPriceInUsdCents = carInfo.pricePerDay * 100 * days;
      const depositInUsdCents = carInfo.securityDeposit * 100;
      const fuelPricePerGalInUsdCents = carInfo.fuelPricePerGal * 100;
      const location = `${searchCarsResult.searchCarRequest.city}, ${searchCarsResult.searchCarRequest.state}, ${searchCarsResult.searchCarRequest.country}`;

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
      if (!result) {
        alert("sendRentCarRequest error!");
        setRequestSending(false);
        return;
      }

      setRequestSending(false);
      router.push("/guest/trips");
    } catch (e) {
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

  return (
    <GuestLayout>
      <div className="flex flex-col px-8 pt-4">
        <PageTitle title="Search" />
        <div className="search mb-2 flex flex-row items-end">
          <RntButton
            className="w-40 m-2"
            onClick={() => setOpenFilterPanel(true)}
          >
            Filters
          </RntButton>
          <RntInput
            className="w-1/2 m-2"
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
            className="w-1/4 m-2"
            id="dateFrom"
            label="From"
            type="datetime-local"
            value={searchCarRequest.dateFrom}
            onChange={handleChange}
          />
          <RntInput
            className="w-1/4 m-2"
            id="dateTo"
            label="To"
            type="datetime-local"
            value={searchCarRequest.dateTo}
            onChange={handleChange}
          />
          <RntButton className="m-2" onClick={() => searchCars()}>Search</RntButton>
        </div>
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
      <div className="w-full fixed top-0 left-0 bg-gray-500 bg-opacity-50 bg">
        <SlidingPanel
          type={"left"}
          isOpen={openFilterPanel}
          size={30}
          noBackdrop={false}
          backdropClicked={() => setOpenFilterPanel(false)}
          panelContainerClassName="bg-gray-400 bg-opacity-90" //bg-[#1e1e30]
        >
          <div className="flex flex-col py-8">
            <div className="self-end mr-8">
              <i
                className="fi fi-br-cross text-white"
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
    </GuestLayout>
  );
}
