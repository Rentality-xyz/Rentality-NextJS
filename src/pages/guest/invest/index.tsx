import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React from "react";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import InvestContent from "@/features/invest/components/InvestContent";

export default function HostInvest() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("invest.guest_page_title")} />
      <CheckingLoadingAuth>{<InvestContent isHost={false} />}</CheckingLoadingAuth>
    </>
  );
}
