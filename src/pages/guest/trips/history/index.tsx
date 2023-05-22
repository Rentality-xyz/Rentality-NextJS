import GuestLayout from "@/components/guest/layout/guestLayout";
import TripItem from "@/components/guest/tripItem";
import useTrips from "@/hooks/guest/useTrips";

export default function History() {
  const [dataFetched, _, tripsHistory] = useTrips();

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
            {tripsHistory != null && tripsHistory.length > 0 ? (
              tripsHistory.map((value) => {
                return (
                  <TripItem
                    key={value.tripId}
                    tripInfo={value}
                    finishTrip={()=>{}}
                  />
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
