import GuestLayout from "@/components/guest/layout/guestLayout";
import CarSearchItem from "@/components/guest/carSearchItem";
import useAvailableCars from "@/hooks/guest/useAvailableCars";
import Link from "next/link";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { useRouter } from "next/router";

export default function Search() {
  const [dataFetched, availableCars, dataSaved, createTripRequest] =
    useAvailableCars();
    const router = useRouter();

  const sendRentCarRequest = async (carInfo: BaseCarInfo) => {
    try {
      const startDateTime = new Date();
      const endDateTime = new Date(
        startDateTime.getTime() + 1000 * 60 * 60 * 24
      );

      const result = await createTripRequest(
        carInfo.carId,
        carInfo.ownerAddress,
        startDateTime.getTime(),
        endDateTime.getTime(),
        "Start location name",
        "End location name",
        carInfo.pricePerDay,
        0,
        0
      );
      if (!result) {
        alert("sendRentCarRequest error!");
        router.push("/guest/trips");
      }
    } catch (e) {
      console.error("sendRentCarRequest error:" + e);
    }
  };

  return (
    <GuestLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="flex flex-row justify-between items-center">
          <div className="text-2xl">
            <strong>Search</strong>
          </div>
        </div>
        {!dataFetched ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            Loading...
          </div>
        ) : (
          <>
            <div className="font-bold text-l">
              {availableCars?.length ?? 0} car(s) available
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 my-4">
              {availableCars != null && availableCars.length > 0 ? (
                availableCars.map((value) => {
                  return (
                    <CarSearchItem
                      key={value.carId}
                      carInfo={value}
                      sendRentCarRequest={sendRentCarRequest}
                    />
                  );
                })
              ) : (
                <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
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
