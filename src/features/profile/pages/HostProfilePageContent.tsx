import useFetchUserProfile from "../hooks/useFetchUserProfile";
import { useTranslation } from "react-i18next";
import PageTitle from "@/components/pageTitle/pageTitle";
import RntSuspense from "@/components/common/rntSuspense";
import UserProfileInfo from "../components/UserProfileInfo";
import TripDiscountsForm from "@/components/host/tripDiscountsForm";
import DeliveryPriceForm from "@/components/host/deliveryPriceForm";
import useFetchDeliveryPrices from "@/hooks/host/useFetchDeliveryPrices";
import useFetchTripDiscounts from "@/hooks/host/useFetchTripDiscounts";
import useSaveDeliveryPrices from "@/hooks/host/useSaveDeliveryPrices";
import useSaveTripDiscounts from "@/hooks/host/useSaveTripDiscounts";
import UserCurrency from "../components/UserCurrency";
import useFetchUserCurrency from "@/hooks/host/useFetchUserCurrency";

function HostProfilePageContent() {
  const { isLoading } = useFetchUserProfile();
  const { isLoading: isLoadingDeliveryPrices, data: savedDeliveryPrices } = useFetchDeliveryPrices();
  const { mutateAsync: saveDeliveryPrices } = useSaveDeliveryPrices();
  const { isLoading: isLoadingDiscounts, data: savedTripsDiscounts } = useFetchTripDiscounts();
  const { mutateAsync: saveTripDiscounts } = useSaveTripDiscounts();
  const { isLoading: isLoadingUserCurrency, data: userCurrency } = useFetchUserCurrency();

  const { t } = useTranslation();
  console.log("USERCURRENCY", userCurrency);
  return (
    <>
      <PageTitle title={t("profile.title")} />
      <RntSuspense isLoading={isLoading || isLoadingDiscounts || isLoadingDeliveryPrices || isLoadingUserCurrency}>
        <UserProfileInfo />
        <hr />
        <div className="flex flex-col min-[560px]:flex-row min-[560px]:gap-20">
          <TripDiscountsForm savedTripsDiscounts={savedTripsDiscounts} saveTripsDiscounts={saveTripDiscounts} />
          <DeliveryPriceForm savedDeliveryPrices={savedDeliveryPrices} saveDeliveryPrices={saveDeliveryPrices} />
          <UserCurrency userCurrency={userCurrency} />
        </div>
      </RntSuspense>
    </>
  );
}

export default HostProfilePageContent;
