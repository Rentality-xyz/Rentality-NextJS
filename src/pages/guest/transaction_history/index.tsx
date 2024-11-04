import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth/authContext";
import Loading from "@/components/common/Loading";
import InvitationToConnect from "@/components/common/invitationToConnect";
import TransactionHistoryTable from "@/components/transaction_history/TransactionHistoryTable";
import React from "react";

export default function TransactionHistory() {
  const { t } = useTranslation();
  const { isLoadingAuth, isAuthenticated } = useAuth();

  return (
    <>
      <PageTitle title={t("transaction_history.title")} />
      {isLoadingAuth && <Loading />}
      {!isLoadingAuth && !isAuthenticated && <InvitationToConnect />}
      {isAuthenticated && <TransactionHistoryContent isHost={false} t={t} />}
    </>
  );
}
