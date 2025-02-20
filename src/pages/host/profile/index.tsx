import DeliveryPriceForm from "@/components/host/deliveryPriceForm";
import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import PageTitle from "@/components/pageTitle/pageTitle";
import UserProfileInfo from "@/components/profileInfo/userProfileInfo";
import useDeliveryPrices from "@/hooks/host/useDeliveryPrices";
import useTripDiscounts from "@/hooks/host/useTripDiscounts";
import useUserRole from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import RntSuspense from "@/components/common/rntSuspense";
import useFetchUserProfile from "@/features/profile/hooks/useFetchUserProfile";

function Profile() {
  const { isLoading } = useFetchUserProfile();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
  const { userRole } = useUserRole();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      <RntSuspense isLoading={isLoading || isLoadingDiscounts || isLoadingDeliveryPrices}>
        <UserProfileInfo />
        <hr />
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
      </RntSuspense>
    </>
  );
}

export default Profile;
