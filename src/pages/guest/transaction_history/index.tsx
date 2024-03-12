import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryContent from "@/components/transaction_history/transactionHistoryContent";
import useGuestTransactionHistory from "@/hooks/guest/useGuestTransactionHistory";

export default function TransactionHistory() {
    const [isLoading, transactions] = useGuestTransactionHistory();


    return (
        <GuestLayout>
            <div className="flex flex-col">
                <PageTitle title="Transaction history" />
                {/*TODO прибрати !*/}
                {isLoading ? (
                    <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
                ) : (
                    <TransactionHistoryContent isHost={false} transactions={transactions}/>
                )}
            </div>
        </GuestLayout>
    );
}