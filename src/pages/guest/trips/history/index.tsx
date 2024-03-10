import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useGuestTrips from "@/hooks/guest/useGuestTrips";

export default function History() {
  const [isLoading, _, tripsHistory] = useGuestTrips();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {};

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="History" />
        {isLoading ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">Loading...</div>
        ) : (
          <div className="flex flex-col gap-4 pr-4 my-4">
            {tripsHistory != null && tripsHistory.length > 0 ? (
              tripsHistory.map((value) => {
                return (
                  <TripCard
                    key={value.tripId}
                    tripInfo={value}
                    changeStatusCallback={changeStatusCallback}
                    disableButton={true}
                    isHost={false}
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
    </Layout>
  );
}
