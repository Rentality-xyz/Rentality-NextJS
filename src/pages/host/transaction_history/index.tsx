import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import useGuestTransactionHistory from "@/hooks/guest/useGuestTransactionHistory";
import HostLayout from "@/components/host/layout/hostLayout";
import useHostTransactionHistory from "@/hooks/host/useHostTransactionHistory";

export default function TransactionHistory() {
    const [isLoading, transactions] = useHostTransactionHistory();

    return (
        <HostLayout>
            <div className="flex flex-col">
                <PageTitle title="Transaction history" />
                {/*TODO прибрати !*/}
                {isLoading ? (
                    <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
                ) : (
                    <TransactionHistoryContent isHost={false} transactions={transactions}/>
                )}
            </div>
        </HostLayout>
    );
}