import Loading from "@/components/common/Loading";
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
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";

export default function Profile() {
  const [isLoading, savedProfileSettings, saveProfileSettings] = useProfileSettings();
  const [isLoadingDiscounts, savedTripsDiscounts, saveTripDiscounts] = useTripDiscounts();
  const [isLoadingDeliveryPrices, savedDeliveryPrices, saveDeliveryPrices] = useDeliveryPrices();
  const { userRole } = useUserRole();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <PageTitle title={t("profile.title")} />
      {isLoading && <Loading />}
      {!isLoading && !isAuthenticated && <InvitationToConnect />}
      {!isLoading && !isLoadingDiscounts && !isLoadingDeliveryPrices && (
        <>
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
              t={t}
            />
            <DeliveryPriceForm
              savedDeliveryPrices={savedDeliveryPrices}
              saveDeliveryPrices={saveDeliveryPrices}
              isUserHasHostRole={userRole === "Host"}
              t={t}
            />
          </div>

          <AddFunds />
        </>
      )}
    </>
  );
}
