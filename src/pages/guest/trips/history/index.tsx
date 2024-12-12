import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useGuestTrips from "@/hooks/guest/useGuestTrips";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

function History() {
  const { isLoadingTrips, tripsHistory, confirmCarDetails } = useGuestTrips();
  const { t } = useTranslation();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {
    return true;
  };
  const handleConfirmCarDetails = async (tripId: number) => {
    await confirmCarDetails(tripId);
  };

  return (
    <>
      <PageTitle title={t("booked.history_title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoadingTrips}>
          <div className="my-4 flex flex-col gap-4 pr-4">
            {tripsHistory != null && tripsHistory.length > 0 ? (
              tripsHistory.map((value) => {
                return (
                  <TripCard
                    key={value.tripId}
                    tripInfo={value}
                    changeStatusCallback={changeStatusCallback}
                    disableButton={true}
                    isHost={false}
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
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}

export default History;
