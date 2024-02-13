import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useHostTrips from "@/hooks/host/useHostTrips";
import useRntDialogs from "@/hooks/useRntDialogs";
import { useState } from "react";

export default function Booked() {
  const [isLoading, tripsBooked, _, updateData] = useHostTrips();
  const [tripStatusChanging, setTripStatusChanging] = useState<boolean>(false);
  //const router = useRouter();
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {
    try {
      setTripStatusChanging(true);

      showInfo("Please confirm the transaction with your wallet and wait for the transaction to be processed");
      const result = await changeStatus();

      if (!result) {
        throw new Error("changeStatus error");
      }
      showInfo("Status successfully changed!");

      setTripStatusChanging(false);
      updateData();
      //router.reload();
    } catch (e) {
      showError("Change trip status request failed. Please try again");

      setTripStatusChanging(false);
    }
  };

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Booked" />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <div className="my-4 flex flex-col gap-4">
            {tripsBooked != null && tripsBooked.length > 0 ? (
              tripsBooked.map((value) => {
                return (
                  <TripCard
                    key={value.tripId}
                    tripInfo={value}
                    changeStatusCallback={changeStatusCallback}
                    disableButton={tripStatusChanging}
                    isHost={true}
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
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
