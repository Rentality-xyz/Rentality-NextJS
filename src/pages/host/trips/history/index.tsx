import HostLayout from "@/components/host/layout/hostLayout";
import TripItem, { TripInfo, TripStatus } from "@/components/host/tripItem";
import useTrips from "@/hooks/host/useTrips";

export default function History() {
  const [dataFetched, _, tripsHistory] = useTrips();
  return (
    <HostLayout>
      <div className="flex flex-col px-8 pt-4">
        <div className="text-2xl">Booked</div>
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <div className="my-4 flex flex-col gap-4 pr-4">
            {tripsHistory != null && tripsHistory.length > 0 ? (
              tripsHistory.map((value) => {
                return (
                  <TripItem
                    key={value.tripId}
                    tripInfo={value}
                    acceptRequest={(i)=>{}}
                    rejectRequest={(i)=>{}}
                    finishTrip={(i)=>{}}
                  />
                );
              })
            ) : (
              <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                You dont have booked trips
              </div>
            )}
          </div>
        )}
      </div>
    </HostLayout>
  );
}
