import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import CreateCarInvestment from "@/features/invest/pages/createInvestment";

export default function CreateInvest() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageTitle title={"Create investment"} />

        <CreateCarInvestment t={t} />
      </div>
    </>
  );
}
