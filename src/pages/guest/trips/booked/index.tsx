import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useGuestTrips from "@/hooks/guest/useGuestTrips";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useState } from "react";

export default function Booked() {
  const [isLoading, tripsBooked, _, updateData] = useGuestTrips();
  const [tripStatusChanging, setTripStatusChanging] = useState<boolean>(false);
  const { showInfo, showError } = useRntDialogs();

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
    <Layout>
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
                    isHost={false}
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
    </Layout>
  );
}
