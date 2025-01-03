import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import { useTranslation } from "react-i18next";
import React from "react";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import ReferralsAndPointsContent from "@/components/points/ReferralsAndPointsContent";

export default function ReferralsAndPoints() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("referrals_and_point.title")} />
      <CheckingLoadingAuth>{<ReferralsAndPointsContent isHost={true} />}</CheckingLoadingAuth>
    </>
  );
}
