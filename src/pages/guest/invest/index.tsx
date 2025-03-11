import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React from "react";
import InvestPageContent from "@/features/invest/pages/InvestPageContent";

export default function GuestInvest() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("invest.guest_page_title")} />
      <InvestPageContent />
    </>
  );
}
