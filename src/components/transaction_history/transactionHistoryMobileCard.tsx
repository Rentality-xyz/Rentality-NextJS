import Link from "next/link";
import {TransactionHistoryInfo} from "@/model/TransactionHistoryInfo";
import {
    dateFormat,
    dateFormatDayMonthTime, dateFormatMonthDate,
    dateFormatYearMonthDayTime, dateRangeFormatDayMonth,
    dateToHtmlDateTimeFormat
} from "@/utils/datetimeFormatters";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import React, {useState} from "react";
import RntSelect from "@/components/common/rntSelect";
import ReactPaginate from 'react-paginate';
import {ClaimStatus, TripStatus} from "@/model/blockchain/schemas";
import {getStringFromMoneyInCents} from "@/utils/formInput";
import {
    getTripStatusBgColorClassFromStatus,
    getTripStatusFromContract,
    getTripStatusTextFromStatus
} from "@/model/TripInfo";

type Props =
    {
    isHost: boolean;
    index: number;
    transaction: TransactionHistoryInfo;
};

export default function TransactionHistoryMobileCard(props: Props) {
    const {isHost, index, transaction} = props;
    const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${transaction.transHistoryId}`;
    const tripStatus = getTripStatusFromContract(Number(transaction.status));
    let statusBgColor = getTripStatusBgColorClassFromStatus(tripStatus);

    return (
        <div key={transaction.transHistoryId} className="mt-8">
            <div className="flex text-sm justify-between mb-2">
                <strong className="font-normal text-rentality-secondary-shade">{dateRangeFormatDayMonth(transaction.startDateTime, transaction.endDateTime)}</strong>
                <strong className={statusBgColor + " font-normal px-1 rounded"}>{getTripStatusTextFromStatus(tripStatus)}</strong>
            </div>
            {!isHost && (
                <div>
                    <div className="flex text-sm justify-between mx-4 mb-2">
                        <strong className="font-normal">Trip payments</strong>
                        <strong className="font-normal">${transaction.tripPayment}</strong>
                    </div>
                    <div className="flex text-sm justify-between mx-4 mb-2">
                        <strong className="font-normal">Refund</strong>
                        <strong className="font-normal">${transaction.refund}</strong>
                    </div>
                </div>
            )}
            {isHost && (
                <div className="flex text-sm justify-between mx-4 mb-2">
                    <strong className="font-normal">Host Earnings</strong>
                    <strong className="font-normal">${transaction.tripEarnings}</strong>
                </div>
            )}
            <div className="flex text-sm justify-between mb-2">
                <strong className="font-normal">{transaction.car}</strong>
                <Link href={detailsLink}>
                    <span className="font-normal text-rentality-secondary-shade">Details</span>
                </Link>
            </div>
            <hr className="border-b-2 border-b-gray-300" />
        </div>
    );
}