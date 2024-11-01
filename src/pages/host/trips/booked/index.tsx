import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useHostTrips from "@/hooks/host/useHostTrips";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import { useAuth } from "@/contexts/auth/authContext";
import InvitationToConnect from "@/components/common/invitationToConnect";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";

export default function Booked() {
  const [isLoadingTrips, tripsBooked, _, updateData] = useHostTrips();
  const [tripStatusChanging, setTripStatusChanging] = useState<boolean>(false);
  const { showInfo, showError } = useRntSnackbars();
  const { t } = useTranslation();
  const { isLoadingAuth, isAuthenticated } = useAuth();

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
      return true;
    } catch (e) {
      showError(t("booked.status_req_failed"));

      setTripStatusChanging(false);
      return false;
    }
  };

  return (
    <>
      <PageTitle title={t("booked.title")} />
      <CheckingLoadingAuth>
        {!isLoadingAuth && isAuthenticated && isLoadingTrips && <Loading />}
        {!isLoadingAuth && isAuthenticated && !isLoadingTrips && (
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
      </CheckingLoadingAuth>
    </>
  );
}
