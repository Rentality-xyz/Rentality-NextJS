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
import InsuranceRules from "@/components/host/InsuranceRule";
import useFetchHostInsuranceRule from "@/hooks/host/useFetchHostInsuranceRule";

function HostProfilePageContent() {
  const { isLoading } = useFetchUserProfile();
  const { isLoading: isLoadingDeliveryPrices, data: savedDeliveryPrices } = useFetchDeliveryPrices();
  const { mutateAsync: saveDeliveryPrices } = useSaveDeliveryPrices();
  const { isLoading: isLoadingDiscounts, data: savedTripsDiscounts } = useFetchTripDiscounts();
  const { mutateAsync: saveTripDiscounts } = useSaveTripDiscounts();
  const { isLoading: isLoadingUserCurrency, data: userCurrency } = useFetchUserCurrency();
  const { isLoading: isLoadingHostInsuranceRule, data: hostInsuranceRule } = useFetchHostInsuranceRule();

  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t("profile.title")} />
      <RntSuspense isLoading={isLoading || isLoadingDiscounts || isLoadingDeliveryPrices || isLoadingUserCurrency || isLoadingHostInsuranceRule}>
        <UserProfileInfo />
        <hr />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <TripDiscountsForm savedTripsDiscounts={savedTripsDiscounts} saveTripsDiscounts={saveTripDiscounts} />
          <DeliveryPriceForm savedDeliveryPrices={savedDeliveryPrices} saveDeliveryPrices={saveDeliveryPrices} />
          <UserCurrency userCurrency={userCurrency} />
          <InsuranceRules hostInsuranceRule={hostInsuranceRule} />
        </div>
      </RntSuspense>
    </>
  );
}

export default HostProfilePageContent;
