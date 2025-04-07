import PageTitle from "@/components/pageTitle/pageTitle";
import StartHostingInvestmentPageContent from "@/features/invest/pages/StartHostingInvestmentPageContent";
import { useTranslation } from "react-i18next";

export default function StartHostingInvestment() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("invest.title_start_hosting_investment")} />
      <StartHostingInvestmentPageContent />
    </>
  );
}
