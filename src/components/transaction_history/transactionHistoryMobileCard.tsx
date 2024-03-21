import Link from "next/link";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import React from "react";
import { getTripStatusBgColorClassFromStatus, getTripStatusTextFromStatus } from "@/model/TripInfo";

type Props = {
  isHost: boolean;
  transaction: TransactionHistoryInfo;
};

export default function TransactionHistoryMobileCard(props: Props) {
  const { isHost, transaction } = props;
  const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${transaction.transHistoryId}`;
  let statusBgColor = getTripStatusBgColorClassFromStatus(transaction.status);

  return (
    <div key={transaction.transHistoryId} className="mt-8">
      <div className="flex text-sm justify-between mb-2">
        <span className="text-rentality-secondary-shade">
          {dateRangeFormatShortMonthDateYear(transaction.startDateTime, transaction.endDateTime)}
        </span>
        <span className={statusBgColor + " px-1 rounded"}>{getTripStatusTextFromStatus(transaction.status)}</span>
      </div>
      {!isHost && (
        <div>
          <div className="flex text-sm justify-between mx-4 mb-2">
            <span>Trispan payments</span>
            <span>${transaction.tripPayment}</span>
          </div>
          <div className="flex text-sm justify-between mx-4 mb-2">
            <span>Refund</span>
            <span>${transaction.refund}</span>
          </div>
        </div>
      )}
      {isHost && (
        <div className="flex text-sm justify-between mx-4 mb-2">
          <span>Host Earnings</span>
          <span>${transaction.tripEarnings}</span>
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
