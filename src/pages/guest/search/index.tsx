import GuestLayout from "@/components/guest/layout/guestLayout";
import CarSearchItem from "@/components/guest/carSearchItem";
import useAvailableCars from "@/hooks/guest/useAvailableCars";
import Link from "next/link";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { useRouter } from "next/router";
import { useState } from "react";
import { dateToHtmlDateFormat } from "@/utils/datetimeFormatters";
import { TripSearchInfo } from "@/model/TripSearchInfo";

export default function Search() {
  const [dataFetched, availableCars, updateData, dataSaved, createTripRequest] = useAvailableCars();
  const [tripDays, setTripDays] = useState(1);
  const [searchParams, setSearchParams] = useState<TripSearchInfo>({
    location: "Miami, FI, United States",
    dateFrom: dateToHtmlDateFormat(new Date()),
    dateTo: dateToHtmlDateFormat(new Date())
  });
  const [enteredSearchParams, setEnteredSearchParams] = useState<TripSearchInfo>({
    location: "Miami, FI, United States",
    dateFrom: dateToHtmlDateFormat(new Date()),
    dateTo: dateToHtmlDateFormat(new Date())
  });
  const router = useRouter();

  const calculateDays = (dateFrom: Date, dateTo: Date) => {
    let difference = dateTo.getTime() - dateFrom.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
  };

  const search = async () => {
    const startDateTime = new Date(enteredSearchParams.dateFrom);
    const endDateTime = new Date(enteredSearchParams.dateTo);
    let days = calculateDays(startDateTime, endDateTime) + 1;
    if (days < 0) {
      days = 0;
    }

    await updateData();

    setSearchParams(enteredSearchParams);
    setTripDays(days);
  };

  const sendRentCarRequest = async (carInfo: BaseCarInfo) => {
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
      const totalPrice = carInfo.pricePerDay * tripDays;

      const result = await createTripRequest(
        carInfo.carId,
        carInfo.ownerAddress,
        startDateTime.getTime(),
        endDateTime.getTime(),
        searchParams.location,
        searchParams.location,
        totalPrice,
        0,
        0
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
      [name]: value
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
              search();
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
                      carInfo={value}
                      tripDays={tripDays}
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
