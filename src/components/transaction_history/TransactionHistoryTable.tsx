import { TFunction } from "@/utils/i18n";
import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import Loading from "../common/Loading";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import TransactionHistoryMobileCard from "./transactionHistoryMobileCard";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import Link from "next/link";

type TransactionHistoryTableProps = {
  isLoading: boolean;
  data: TransactionHistoryInfo[];
  isHost: boolean;
};

function TransactionHistoryTable({ isLoading, data, isHost }: TransactionHistoryTableProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const t_th: TFunction = (name, options) => {
    return t("transaction_history." + name, options);
  };

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  if (isLoading) {
    return (
      <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName} colSpan={2}>
              <div className="flex flex-col text-rentality-secondary">
                {t_th("guest_payments")}
                <span className="h-1 w-full border-b-2 border-rentality-secondary" />
              </div>
            </th>
            <th className={headerSpanClassName} colSpan={3}>
              <div className="flex flex-col text-rentality-button-medium">
                {t_th("host_earnings")}
                <span className="h-1 w-full border-b-2 border-[#7f5ee7]" />
              </div>
            </th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
          </tr>
        </thead>
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={headerSpanClassName}>{t_th("car")}</th>
            <th className={headerSpanClassName}>{t_th("tripId")}</th>
            <th className={headerSpanClassName}>{t_th("status")}</th>
            <th className={headerSpanClassName}>{t_th("days")}</th>
            <th className={headerSpanClassName}>{t_th("start_date")}</th>
            <th className={headerSpanClassName}>{t_th("end_date")}</th>
            <th className={headerSpanClassName}>{t_th("trip_payment")}</th>
            <th className={headerSpanClassName}>{t_th("refund")}</th>
            <th className={headerSpanClassName}>{t_th("trip_earnings")}</th>
            <th className={headerSpanClassName}>{t_th("cancellation_fee")}</th>
            <th className={headerSpanClassName}>{t_th("reimbursements")}</th>
            <th className={headerSpanClassName}>{t_th("rentality_fee")}</th>
            <th className={headerSpanClassName}>{t_th("taxes")}</th>
            <th className={headerSpanClassName}></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((transaction) => {
            const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${transaction.transHistoryId}?back=${pathname}`;

            return (
              <tr key={transaction.transHistoryId} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{transaction.car}</td>
                <td className={rowSpanClassName}>{transaction.tripId}</td>
                <td className={rowSpanClassName}>{getTripStatusTextFromStatus(transaction.status)}</td>
                <td className={rowSpanClassName}>{transaction.days}</td>
                <td className={rowSpanClassName}>
                  {dateFormatShortMonthDateTime(transaction.startDateTime, transaction.timeZoneId)}
                </td>
                <td className={rowSpanClassName}>
                  {dateFormatShortMonthDateTime(transaction.endDateTime, transaction.timeZoneId)}
                </td>
                <td className={rowSpanClassName}>${transaction.tripPayment}</td>
                <td className={rowSpanClassName}>${transaction.refund}</td>
                <td className={rowSpanClassName}>${transaction.tripEarnings}</td>
                <td className={rowSpanClassName}>${transaction.cancellationFee}</td>
                <td className={rowSpanClassName}>${transaction.reimbursements}</td>
                <td className={rowSpanClassName}>${transaction.rentalityFee}</td>
                <td className={rowSpanClassName}>
                  ${displayMoneyWith2Digits(transaction.salesTax + transaction.governmentTax)}
                </td>
                <td className={rowSpanClassName}>
                  <Link href={detailsLink}>
                    <span className="text-rentality-secondary">{t_th("details")}</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="lg:hidden">
        {data.map((transaction) => {
          return (
            <TransactionHistoryMobileCard key={transaction.transHistoryId} isHost={isHost} transaction={transaction} />
          );
        })}
      </div>
    </>
  );
}

export default TransactionHistoryTable;
