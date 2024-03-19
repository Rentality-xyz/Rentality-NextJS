import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import Layout from "@/components/layout/layout";
import useTransactionHistory from "@/hooks/transaction_history/useTransactionHistory";

export default function TransactionHistory() {
  const [isLoading, transactions] = useTransactionHistory(true);

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Transaction history" />
        {/*TODO прибрати !*/}
        {!isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <TransactionHistoryContent isHost={true} transactions={transactions} />
        )}
      </div>
    </Layout>
  );
}
