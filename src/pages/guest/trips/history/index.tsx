import GuestLayout from "@/components/guest/layout/guestLayout";
import TripItem from "@/components/guest/tripItem";
import PageTitle from "@/components/pageTitle/pageTitle";
import useGuestTrips from "@/hooks/guest/useGuestTrips";

export default function History() {
  const [dataFetched, _, tripsHistory] = useGuestTrips();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {
  };

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="History"/>
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
                    changeStatusCallback = {changeStatusCallback}
                    disableButton={true}
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
