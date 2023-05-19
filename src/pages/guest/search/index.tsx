import GuestLayout from "@/components/guest/layout/guestLayout";
import CarSearchItem from "@/components/guest/carSearchItem";
import useAvailableCars from "@/hooks/guest/useAvailableCars";
import Link from "next/link";

export default function Search() {
  const [dataFetched, availableCars, sendRentCarRequest] = useAvailableCars();

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
            <div>Found {availableCars?.length ?? 0} car(s)</div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 my-4">
              {availableCars != null && availableCars.length > 0 ? (
                availableCars.map((value) => {
                  return <CarSearchItem key={value.tokenId} carInfo={value} sendRentCarRequest={sendRentCarRequest} />;
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
