import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import TripItem from "@/components/host/tripItem";
import PageTitle from "@/components/pageTitle/pageTitle";
import useHostTrips from "@/hooks/host/useHostTrips";
import useRntDialogs from "@/hooks/useRntDialogs";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Booked() {
  const [dataFetched, tripsBooked, _, updateData] = useHostTrips();
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
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <div className="my-4 flex flex-col gap-4 pr-4">
            {tripsBooked != null && tripsBooked.length > 0 ? (
              tripsBooked.map((value) => {
                return (
                  <TripItem
                    key={value.tripId}
                    tripInfo={value}
                    changeStatusCallback={changeStatusCallback}
                    disableButton={tripStatusChanging}
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
