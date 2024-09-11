import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import { useTranslation } from "react-i18next";

export default function TransactionHistory() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("transaction_history.title")} />
      <TransactionHistoryContent isHost={false} t={t} />
    </>
  );
}
