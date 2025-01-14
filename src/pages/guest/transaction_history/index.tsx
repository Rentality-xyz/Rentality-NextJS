import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import { useTranslation } from "react-i18next";
import React from "react";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";

function TransactionHistory() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("transaction_history.title")} />
      <CheckingLoadingAuth>
        <TransactionHistoryContent isHost={false} />
      </CheckingLoadingAuth>
    </>
  );
}

export default TransactionHistory;
