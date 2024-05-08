import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import ProfileInfoPage from "@/components/profileInfo/profileInfoPage";
import useTripDiscounts from "@/hooks/host/useTripDiscounts";
import useProfileSettings from "@/hooks/useProfileSettings";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("profile.title")} />
        {isLoading || isLoadingDiscounts ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <>
            <ProfileInfoPage
              savedProfileSettings={savedProfileSettings}
              saveProfileSettings={saveProfileSettings}
              isHost={true}
              t={t}
            />
            <TripDiscountsForm savedTripsDiscounts={savedTripsDiscounts} saveTripsDiscounts={saveTripDiscounts} t={t} />
          </>
        )}
      </div>
    </Layout>
  );
}
