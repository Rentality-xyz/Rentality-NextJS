import GuestLayout from "@/components/guest/layout/guestLayout";
import TripItem, { TripInfo, TripStatus } from "@/components/guest/tripItem";
import useTripsBooked from "@/hooks/guest/useTripsBooked";

export default function Booked() {
  const [dataFetched, tripsBooked] = useTripsBooked();

  return (
    <GuestLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="text-2xl">Booked</div>
        {!dataFetched ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            Loading...
          </div>
        ) : (
          <div className="flex flex-col gap-4 pr-4 my-4">
            {tripsBooked != null && tripsBooked.length > 0 ? (
              tripsBooked.map((value) => {
                return (
                  <TripItem key={value.tripId} tripInfo={value}></TripItem>
                );
              })
            ) : (
              <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                You dont have booked trips
              </div>
            )}
          </div>
        )}
      </div>
    </GuestLayout>
  );
}
