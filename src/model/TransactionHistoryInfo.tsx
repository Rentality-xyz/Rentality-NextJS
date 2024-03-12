import {ClaimStatus, ClaimType} from "@/model/blockchain/schemas";

export type TransactionHistoryInfo = {
    transHistoryId: number;
    car: string;
    status: string;
    days: number;
    startDateTime: Date;
    endDateTime: Date;
    tripPayment: number;
    refund: number;
    tripEarnings: number;
    cancellationFee: number;
    reimbursements: number;
    rentalityFee: number;
};