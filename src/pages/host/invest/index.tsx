import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React from "react";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import InvestContent from "@/components/invest/InvestContent";

export default function HostInvest() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("invest.host_page_title")} />
      <CheckingLoadingAuth>{<InvestContent isHost={true} />}</CheckingLoadingAuth>
    </>
  );
}
