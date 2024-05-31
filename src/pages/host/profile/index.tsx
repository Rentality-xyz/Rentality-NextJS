import DeliveryPriceForm from "@/components/host/deliveryPriceForm";
import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import ProfileRnD from "@/components/RnD/profileRnD";
import useDeliveryPrices from "@/hooks/host/useDeliveryPrices";
import useTripDiscounts from "@/hooks/host/useTripDiscounts";
import useProfileSettings from "@/hooks/useProfileSettings";
import useUserRole from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("profile.title")} />
        {isLoading || isLoadingDiscounts || isLoadingDeliveryPrices ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <>
            <UserProfileInfo
              savedProfileSettings={savedProfileSettings}
              saveProfileSettings={saveProfileSettings}
              isHost={true}
              t={t}
            />
            <div className="flex flex-wrap gap-20">
              <TripDiscountsForm
                savedTripsDiscounts={savedTripsDiscounts}
                saveTripsDiscounts={saveTripDiscounts}
                isUserHasHostRole={userRole === "Host"}
                t={t}
              />
              <DeliveryPriceForm
                savedDeliveryPrices={savedDeliveryPrices}
                saveDeliveryPrices={saveDeliveryPrices}
                isUserHasHostRole={userRole === "Host"}
                t={t}
              />
            </div>

            <ProfileRnD />
          </>
        )}
      </div>
    </Layout>
  );
}
