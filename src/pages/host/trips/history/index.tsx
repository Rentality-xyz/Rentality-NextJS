import Loading from "@/components/common/Loading";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useHostTrips from "@/hooks/host/useHostTrips";
import { useTranslation } from "react-i18next";
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";

export default function History() {
  const [isLoadingTrips, _, tripsHistory] = useHostTrips();
  const { t } = useTranslation();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {};

  return (
    <>
      <PageTitle title={t("booked.history_title")} />
      <CheckingLoadingAuth>
        {!isLoadingTrips && (
          <div className="my-4 flex flex-col gap-4">
            {tripsHistory != null && tripsHistory.length > 0 ? (
              tripsHistory.map((value) => {
                return (
                  <TripCard
                    key={value.tripId}
                    tripInfo={value}
                    changeStatusCallback={changeStatusCallback}
                    disableButton={true}
                    isHost={true}
                    t={t}
                  />
                );
              })
            ) : (
              <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
                {t("booked.history_no_trips")}
              </div>
            )}
          </div>
        )}
      </CheckingLoadingAuth>
    </>
  );
}
