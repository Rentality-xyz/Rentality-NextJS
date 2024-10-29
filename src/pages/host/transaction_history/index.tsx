import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import InvitationToConnect from "@/components/common/invitationToConnect";
import React from "react";
import { useAuth } from "@/contexts/auth/authContext";

export default function TransactionHistory() {
  const { t } = useTranslation();
  const { isLoadingAuth, isAuthenticated } = useAuth();

  return (
    <>
      <PageTitle title={t("transaction_history.title")} />
      {isLoadingAuth && <Loading />}
      {!isLoadingAuth && !isAuthenticated && <InvitationToConnect />}
      {isAuthenticated && <TransactionHistoryContent isHost={true} t={t} />}
    </>
  );
}
