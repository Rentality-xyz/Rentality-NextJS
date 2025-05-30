import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useGuestTrips from "@/hooks/guest/useGuestTrips";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import RntSuspense from "@/components/common/rntSuspense";
import { logger } from "@/utils/logger";
import { AllowedChangeTripAction } from "@/model/TripInfo";
import getNetworkName from "@/model/utils/NetworkName";

function Booked() {
  const ethereumInfo = useEthereum();
  const { isLoadingTrips, tripsBooked, updateData } = useGuestTrips();
  const [tripStatusChanging, setTripStatusChanging] = useState<boolean>(false);
  const { showInfo, showError, showSuccess } = useRntSnackbars();
  const { t } = useTranslation();

  const changeStatusCallback = async (action: AllowedChangeTripAction, changeStatus: () => Promise<boolean>) => {
    if (!ethereumInfo) {
      logger.error("changeStatusCallback error: ethereumInfo is null");
      return false;
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      logger.error("changeStatusCallback error: user don't have enough funds");
      showError(
        t("common.add_fund_to_wallet", {
          network: getNetworkName(ethereumInfo),
        })
      );
      return false;
    }

    setTripStatusChanging(true);

    showInfo(t("common.info.sign"));

    const result = await changeStatus();

    if (result) {
      showSuccessCurrentStatus(action);
      updateData();
    } else {
      showError(t("booked.status_req_failed"));
    }
    setTripStatusChanging(false);

    return result;
  };

  const showSuccessCurrentStatus = (action: AllowedChangeTripAction) => {
    switch (action.text) {
      case "Start":
        showSuccess(t("booked.trip_started"));
        return;
      case "Finish":
        showSuccess(t("booked.trip_finished"));
        return;
      default:
        showSuccess(t("booked.status_changed"));
        return;
    }
  };

  return (
    <>
      <PageTitle title={t("booked.title")} />
      <RntSuspense isLoading={isLoadingTrips}>
        <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {tripsBooked != null && tripsBooked.length > 0 ? (
            tripsBooked.map((value) => {
              return (
                <TripCard
                  key={value.tripId}
                  tripInfo={value}
                  changeStatusCallback={(action, changeStatus) => changeStatusCallback(action, changeStatus)}
                  disableButton={tripStatusChanging}
                  isHost={false}
                  isBooked={true}
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
      </RntSuspense>
    </>
  );
}

export default Booked;
