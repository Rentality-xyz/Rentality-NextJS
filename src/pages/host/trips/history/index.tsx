import HostLayout from "@/components/host/layout/hostLayout";
import TripItem from "@/components/host/tripItem";
import useHostTrips from "@/hooks/host/useHostTrips";

export default function History() {
  const [dataFetched, _, tripsHistory] = useHostTrips();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {
  };

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
                    changeStatusCallback = {changeStatusCallback}
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
