import GuestLayout from "@/components/guest/layout/guestLayout";
import CarSearchItem from "@/components/guest/carSearchItem";
import useAvailableCars from "@/hooks/guest/useAvailableCars";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import { TripSearchInfo } from "@/model/TripSearchInfo";
import { SearchCarInfo } from "@/model/SearchCarInfo";
import { calculateDays } from "@/utils/date";

export default function Search() {
  const emptyTripSearchInfo: TripSearchInfo = {
    location: "Miami, FI, United States",
    dateFrom: dateToHtmlDateFormat(new Date()),
    dateTo: dateToHtmlDateFormat(new Date()),
  };

  const [dataFetched, availableCars, searchAvailableCars, dataSaved, createTripRequest] =
    useAvailableCars();
  const [tripDays, setTripDays] = useState(1);
  const [searchParams, setSearchParams] =
    useState<TripSearchInfo>(emptyTripSearchInfo);
  const [enteredSearchParams, setEnteredSearchParams] =
    useState<TripSearchInfo>(emptyTripSearchInfo);
  const router = useRouter();

  const searchCars = async () => {
    const startDateTime = new Date(enteredSearchParams.dateFrom);
    const endDateTime = new Date(enteredSearchParams.dateTo);
    let days = calculateDays(startDateTime, endDateTime) + 1;
    if (days < 0) {
      days = 0;
    }

    await searchAvailableCars(enteredSearchParams.location, startDateTime, endDateTime);

    setSearchParams(enteredSearchParams);
    setTripDays(days);
  };

  const sendRentCarRequest = async (carInfo: SearchCarInfo) => {
    try {
      if (searchParams.dateFrom == null) {
        alert("Please enter Date From");
        return;
      }
      if (searchParams.dateTo == null) {
        alert("Please enter Date To");
        return;
      }
      const startDateTime = new Date(searchParams.dateFrom);
      const endDateTime = new Date(searchParams.dateTo);

      const days = calculateDays(startDateTime, endDateTime);
      if (days < 0) {
        alert("Date to must be greater than Date from");
        return;
      }
      const totalPriceInUsdCents = carInfo.pricePerDay * 100 * tripDays;
      const depositInUsdCents = 100*100;

      const result = await createTripRequest(
        carInfo.carId,
        carInfo.ownerAddress,
        startDateTime.getTime(),
        endDateTime.getTime(),
        searchParams.location,
        searchParams.location,
        totalPriceInUsdCents,
        0,
        depositInUsdCents
      );
      if (!result) {
        alert("sendRentCarRequest error!");
        return;
      }
      router.push("/guest/trips");
    } catch (e) {
      console.error("sendRentCarRequest error:" + e);
    }
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const name = e.target.name;

    setEnteredSearchParams({
      ...enteredSearchParams,
      [name]: value,
    });
  }

  return (
    <GuestLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="search mb-8 flex flex-row">
          <div className="flex w-1/2 flex-col p-2">
            <label htmlFor="location">Pick up & Return Location</label>
            <input
              id="location"
              name="location"
              className="w-full"
              type="text"
              value={enteredSearchParams.location}
              onChange={handleChange}
            />
          </div>
          <div className="flex w-1/4 flex-col p-2">
            <label htmlFor="dateFrom">From</label>
            <input
              id="dateFrom"
              name="dateFrom"
              className="w-full"
              type="date"
              value={enteredSearchParams.dateFrom}
              onChange={handleChange}
            />
          </div>
          <div className="flex w-1/4 flex-col p-2">
            <label htmlFor="dateTo">To</label>
            <input
              id="dateTo"
              name="dateTo"
              className="w-full"
              type="date"
              value={enteredSearchParams.dateTo}
              onChange={handleChange}
            />
          </div>
          <button
            className="h-16 w-56 self-end rounded-md bg-violet-700"
            onClick={() => {
              searchCars();
            }}
          >
            Search
          </button>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-2xl">
            <strong>Search</strong>
          </div>
        </div>
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <>
            <div className="text-l font-bold">
              {availableCars?.length ?? 0} car(s) available
            </div>
            <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {availableCars != null && availableCars.length > 0 ? (
                availableCars.map((value) => {
                  return (
                    <CarSearchItem
                      key={value.carId}
                      searchInfo={value}
                      sendRentCarRequest={sendRentCarRequest}
                    />
                  );
                })
              ) : (
                <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                  You dont have listed cars
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </GuestLayout>
  );
}
