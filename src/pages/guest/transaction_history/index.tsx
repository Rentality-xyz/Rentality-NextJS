import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent, { SortOptions } from "@/components/transaction_history/transactionHistoryContent";
import useTransactionHistory from "@/hooks/transaction_history/useTransactionHistory";
import { useTranslation } from "react-i18next";

export default function TransactionHistory() {
  const [isLoading, transactions] = useTransactionHistory(false);
  const { t } = useTranslation();

  const sortOption: SortOptions = t("transaction_history.sort_options", {
    returnObjects: true,
  });

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("transaction_history.title")} />
        {/*TODO прибрати !*/}
        {!isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
          <TransactionHistoryContent isHost={false} transactions={transactions} t={t} sortOptions={sortOption} />
        )}
      </div>
    </Layout>
  );
}
