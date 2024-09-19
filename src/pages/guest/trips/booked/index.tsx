import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useGuestTrips from "@/hooks/guest/useGuestTrips";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";

export default function Booked() {
  const { isLoading, tripsBooked, updateData } = useGuestTrips();
  const [tripStatusChanging, setTripStatusChanging] = useState<boolean>(false);
  const { showInfo, showError } = useRntSnackbars();
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
    } catch (e) {
      showError(t("booked.status_req_failed"));

      setTripStatusChanging(false);
    }
  };

  return (
    <>
      <PageTitle title={t("booked.title")} />
      {isLoading && <Loading />}
      {!isLoading && (
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
                  t={t}
                />
              );
            })
          ) : (
            <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between pl-4 text-center">
              {t("booked.trip_not_found")}
            </div>
          )}
        </div>
      )}
    </>
  );
}
