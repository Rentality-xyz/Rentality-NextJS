import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useGuestTrips from "@/hooks/guest/useGuestTrips";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import Loading from "@/components/common/Loading";
import { useAuth } from "@/contexts/auth/authContext";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useEthereum } from "@/contexts/web3/ethereumContext";

export default function Booked() {
  const ethereumInfo = useEthereum();
  const { isLoadingTrips, tripsBooked, updateData } = useGuestTrips();
  const [tripStatusChanging, setTripStatusChanging] = useState<boolean>(false);
  const { showInfo, showError } = useRntSnackbars();
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {
    if (!ethereumInfo) {
      console.error("changeStatusCallback error: ethereumInfo is null");
      return false;
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      console.error("changeStatusCallback error: user don't have enough funds");
      showError(t("common.add_fund_to_wallet"));
      return false;
    }

    setTripStatusChanging(true);

    showInfo(t("common.info.sign"));

    const result = await changeStatus();

    if (result) {
      showInfo(t("booked.status_changed"));
      updateData();
    } else {
      showError(t("booked.status_req_failed"));
    }
    setTripStatusChanging(false);

    return result;
  };

  return (
    <>
      <PageTitle title={t("booked.title")} />
      <CheckingLoadingAuth>
        {isLoadingTrips && <Loading />}
        {!isLoadingTrips && (
          <div className="my-4 flex flex-col gap-4">
            {tripsBooked != null && tripsBooked.length > 0 ? (
              tripsBooked.map((value) => (
                <TripCard
                  key={value.tripId}
                  tripInfo={value}
                  changeStatusCallback={changeStatusCallback}
                  disableButton={tripStatusChanging}
                  isHost={false}
                  t={t}
                />
              ))
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
