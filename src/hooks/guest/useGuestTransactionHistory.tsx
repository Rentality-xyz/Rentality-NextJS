import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import {ContractTransactionHistory} from "@/model/blockchain/schemas";
import {TransactionHistoryInfo} from "@/model/TransactionHistoryInfo";
import {validateContractTransactionHistory} from "@/model/blockchain/schemas_utils";

const transactionHistoryViewTEST: ContractTransactionHistory[] = [
    {
        transHistoryId: BigInt(0),
        car: "Ford Bronco 2021",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    },
    {
        transHistoryId: BigInt(1),
        car: "Ford Bronco 2022",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    },
    {
        transHistoryId: BigInt(2),
        car: "Ford Bronco 2023",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    },
    {
        transHistoryId: BigInt(3),
        car: "Ford Bronco 2024",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    },
    {
        transHistoryId: BigInt(4),
        car: "Ford Bronco 2025",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    },
    {
        transHistoryId: BigInt(5),
        car: "AUDI Q7 2026",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    },
    {
        transHistoryId: BigInt(6),
        car: "AUDI Q7 2027",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    },
    {
        transHistoryId: BigInt(7),
        car: "AUDI Q7 2028",
        status: "Completed",
        days: BigInt(2),
        startDateTime: BigInt(1663003540000),
        endDateTime: BigInt(1663176540000),
        tripPayment: BigInt(600),
        refund: BigInt(400),
        tripEarnings: BigInt(80),
        cancellationFee: BigInt(8),
        reimbursements: BigInt(80),
        rentalityFee: BigInt(22)
    }
];

const useGuestTransactionHistory = () => {
    const rentalityInfo = useRentality();
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const [transactionsHistory, setTransactionsHistory] = useState<TransactionHistoryInfo[]>([]);

    useEffect(() => {
        const getTransactionsHistory = async (rentalityContract: IRentalityContract) => {

            try {
                if (rentalityContract == null) {
                    console.error("getTransactionsHistory error: contract is null");
                    return;
                }
                const transactionHistoryView: ContractTransactionHistory[] = transactionHistoryViewTEST;

                const transactionHistoryData =
                    transactionHistoryView.length === 0
                        ? []
                        : await Promise.all(
                            transactionHistoryView.map(async (i: ContractTransactionHistory, index) => {
                                if (index === 0) {
                                    validateContractTransactionHistory(i);
                                }

                                let item: TransactionHistoryInfo = {
                                    transHistoryId: Number(i.transHistoryId),
                                    car: i.car,
                                    status: i.status,
                                    days: Number(i.days),
                                    startDateTime: new Date(Number(i.startDateTime)),
                                    endDateTime: new Date(Number(i.endDateTime)),
                                    tripPayment: Number(i.tripPayment),
                                    refund: Number(i.refund),
                                    tripEarnings: Number(i.tripEarnings),
                                    cancellationFee: Number(i.cancellationFee),
                                    reimbursements: Number(i.reimbursements),
                                    rentalityFee: Number(i.rentalityFee),
                                };
                                return item;
                            })
                        );

                return transactionHistoryData;
            } catch (e) {
                console.error("getTransactionHistory error:" + e);
            }
        };

        if (!rentalityInfo) return;

        setIsLoading(false);

        getTransactionsHistory(rentalityInfo)
            .then((data) => {
                setTransactionsHistory(data ?? []);
                setIsLoading(true);
            })
            .catch(() => setIsLoading(true));
    }, [rentalityInfo]);

    return [isLoading, transactionsHistory] as const;
};

export default useGuestTransactionHistory;
