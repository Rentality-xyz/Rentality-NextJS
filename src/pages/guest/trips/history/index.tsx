import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TripCard from "@/components/tripCard/tripCard";
import useGuestTrips from "@/hooks/guest/useGuestTrips";
import { useTranslation } from "react-i18next";

export default function History() {
  const { isLoading, tripsHistory, confirmCarDetails } = useGuestTrips();
  const { t } = useTranslation();

  const changeStatusCallback = async (changeStatus: () => Promise<boolean>) => {};
  const handleConfirmCarDetails = async (tripId: number) => {
    await confirmCarDetails(tripId);
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("booked.history_title")} />
        {isLoading ? (
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <div className="flex flex-col gap-4 pr-4 my-4">
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
              <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {t("booked.history_no_trips")}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
