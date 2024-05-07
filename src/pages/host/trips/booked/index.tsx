import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useHostTrips from "@/hooks/host/useHostTrips";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Booked() {
  const [isLoading, tripsBooked, _, updateData] = useHostTrips();
  const [tripStatusChanging, setTripStatusChanging] = useState<boolean>(false);
  const { showInfo, showError } = useRntDialogs();
  const { t } = useTranslation();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {
    try {
      setTripStatusChanging(true);

      showInfo(t("common.info.sign"));
      const result = await changeStatus();

      if (!result) {
        throw new Error("changeStatus error");
      }
      showInfo(t("booked.status_changed"));

      setTripStatusChanging(false);
      updateData();
      //router.reload();
    } catch (e) {
      showError(t("booked.status_req_failed"));

      setTripStatusChanging(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("booked.title")} />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
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
                    showMoreInfo={true}
                    t={t}
                  />
                );
              })
            ) : (
              <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                {t("booked.trip_not_found")}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
