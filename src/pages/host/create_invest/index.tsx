import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import CreateInvestmentPageContent from "@/features/invest/pages/CreateInvestmentPageContent";

export default function CreateInvest() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("invest.title_create_investment")} />
      <CreateInvestmentPageContent />
    </>
  );
}
