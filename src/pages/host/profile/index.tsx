import DeliveryPriceForm from "@/components/host/deliveryPriceForm";
import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import AddFunds from "@/components/RnD/AddFunds";
import useDeliveryPrices from "@/hooks/host/useDeliveryPrices";
import useTripDiscounts from "@/hooks/host/useTripDiscounts";
import useProfileSettings from "@/hooks/useProfileSettings";
import useUserRole from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoading || isLoadingDiscounts || isLoadingDeliveryPrices}>
          <UserProfileInfo
            savedProfileSettings={savedProfileSettings}
            saveProfileSettings={saveProfileSettings}
            isHost={true}
          />
          <div className="flex flex-col min-[560px]:flex-row min-[560px]:gap-20">
            <TripDiscountsForm
              savedTripsDiscounts={savedTripsDiscounts}
              saveTripsDiscounts={saveTripDiscounts}
              isUserHasHostRole={userRole === "Host"}
            />
            <DeliveryPriceForm
              savedDeliveryPrices={savedDeliveryPrices}
              saveDeliveryPrices={saveDeliveryPrices}
              isUserHasHostRole={userRole === "Host"}
            />
          </div>

          <AddFunds />
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}
