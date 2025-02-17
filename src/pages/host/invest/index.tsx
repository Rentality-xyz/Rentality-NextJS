import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React from "react";
import InvestContent from "@/features/invest/components/InvestContent";

export default function HostInvest() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("invest.host_page_title")} />
      <InvestContent isHost={true} />
    </>
  );
}
