import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import InvitationToConnect from "@/components/common/invitationToConnect";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth/authContext";
import TripCard from "@/components/tripCard/tripCard";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import useTransactionHistory from "@/hooks/transaction_history/useTransactionHistory";

export default function TransactionHistory() {
  const { t } = useTranslation();
  const { isLoading, data, fetchData } = useTransactionHistory(true);

  useEffect(() => {}, [fetchData]);
  const { isLoadingAuth, isAuthenticated } = useAuth();

  return (
    <>
      <PageTitle title={t("transaction_history.title")} />
      <CheckingLoadingAuth
      // title={<PageTitle title={t("transaction_history.title")} />}
      // isLoadingContentPage={isLoading}
      >
        {!isLoadingAuth && isAuthenticated && !isLoading && <Loading />}
        {!isLoadingAuth && isAuthenticated && isLoading && <TransactionHistoryContent isHost={true} t={t} />}
      </CheckingLoadingAuth>
      {/*{isLoadingAuth && <Loading />}*/}
      {/*{!isLoadingAuth && !isAuthenticated && <InvitationToConnect />}*/}
      {/*{isAuthenticated && <TransactionHistoryContent isHost={true} t={t} />}*/}
    </>
  );
}
