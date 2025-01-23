import Link from "next/link";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import React from "react";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { usePathname } from "next/navigation";
import { getTripStatusBgColorFromStatus } from "@/utils/tailwind";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";

type TransactionHistoryMobileCardProps = {
  isHost: boolean;
  transaction: TransactionHistoryInfo;
};

export default function TransactionHistoryMobileCard(props: TransactionHistoryMobileCardProps) {
  const { isHost, transaction } = props;
  const pathname = usePathname();
  const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${transaction.transHistoryId}?back=${pathname}`;
  let statusBgColor = getTripStatusBgColorFromStatus(transaction.status);

  return (
    <div key={transaction.transHistoryId} className="mt-8">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-rentality-secondary">
          {dateRangeFormatShortMonthDateYear(
            transaction.startDateTime,
            transaction.endDateTime,
            transaction.timeZoneId
          )}
        </span>
        <span className={statusBgColor + " rounded px-1"}>{getTripStatusTextFromStatus(transaction.status)}</span>
      </div>
      {!isHost && (
        <div>
          <div className="mx-4 mb-2 flex justify-between text-sm">
            <span>Trip payments</span>
            <span>${displayMoneyWith2Digits(transaction.tripPayment)}</span>
          </div>
          <div className="mx-4 mb-2 flex justify-between text-sm">
            <span>Refund</span>
            <span>${displayMoneyWith2Digits(transaction.refund)}</span>
          </div>
        </div>
      )}
      {isHost && (
        <div className="mx-4 mb-2 flex justify-between text-sm">
          <span>Host Earnings</span>
          <span>${displayMoneyWith2Digits(transaction.tripEarnings)}</span>
        </div>
      )}
      <div className="mb-2 flex justify-between text-sm">
        <strong className="font-normal">{transaction.car}</strong>
        <Link href={detailsLink}>
          <span className="font-normal text-rentality-secondary">Details</span>
        </Link>
      </div>
      <hr className="border-b-2 border-b-gray-300" />
    </div>
  );
}
