import RntSuspense from "@/components/common/rntSuspense";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useHostTrips from "@/hooks/host/useHostTrips";
import { useTranslation } from "react-i18next";

function History() {
  const [isLoadingTrips, _, tripsHistory] = useHostTrips();
  const { t } = useTranslation();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {
    return true;
  };

  return (
    <>
      <PageTitle title={t("booked.history_title")} />
      <RntSuspense isLoading={isLoadingTrips}>
        <div className="my-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {tripsHistory != null && tripsHistory.length > 0 ? (
            tripsHistory.map((value) => {
              return (
                <TripCard
                  key={value.tripId}
                  tripInfo={value}
                  changeStatusCallback={(action, changeStatus) => changeStatusCallback(changeStatus)}
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
      </RntSuspense>
    </>
  );
}

export default History;
