import Link from "next/link";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import {
  dateFormatShortMonthDateTime,
  dateFormatYearMonthDayTime,
  dateToHtmlDateTimeFormat,
} from "@/utils/datetimeFormatters";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import React, { useMemo, useState } from "react";
import RntSelect from "@/components/common/rntSelect";
import ReactPaginate from "react-paginate";
import TransactionHistoryMobileCard from "@/components/transaction_history/transactionHistoryMobileCard";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import { usePathname } from "next/navigation";
import { onlyUnique } from "@/utils/arrays";
import moment from "moment";
import { isEmpty } from "@/utils/string";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";

type TransactionHistoryContentProps = {
  isHost: boolean;
  transactions: TransactionHistoryInfo[];
  t: TFunction;
};

type TransactionHistoryFilterParams = {
  dateFrom: Date;
  dateTo: Date;
  statusFilterBy: string;
};

const defaultDateFrom = moment({ hour: 0 }).subtract(1, "month").toDate();
const defaultDateTo = moment({ hour: 0 }).add(6, "month").toDate();

export default function TransactionHistoryContent({ isHost, transactions, t }: TransactionHistoryContentProps) {
  const pathname = usePathname();
  const [filterParams, setFilterParams] = useState<TransactionHistoryFilterParams>({
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
    statusFilterBy: "",
  });
  const [submitedFilterParams, setSubmitFilterParams] = useState<TransactionHistoryFilterParams>({
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
    statusFilterBy: "",
  });

  const t_th: TFunction = (name, options) => {
    return t("transaction_history." + name, options);
  };

  const statusFilters = [
    { key: "", value: t_th("all_statuses") },
    ...transactions
      .map((i) => i.status)
      .filter(onlyUnique)
      .map((i) => {
        return { key: i.toString(), value: getTripStatusTextFromStatus(i) };
      }),
  ];

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (i) =>
        i.startDateTime >= submitedFilterParams.dateFrom &&
        i.endDateTime <= submitedFilterParams.dateTo &&
        (isEmpty(submitedFilterParams.statusFilterBy) || i.status.toString() === submitedFilterParams.statusFilterBy)
    );
  }, [transactions, submitedFilterParams]);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSearchClick = async () => {
    setSubmitFilterParams(filterParams);
  };

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  return (
    <div className="relative w-full min-h-[540px] pb-16 bg-rentality-bg p-4 rounded-2xl mt-5">
      <div className="flex max-lg:flex-col items-center lg:items-end">
        <RntInput
          className="max-w-[320px] lg:max-w-[210px] lg:mr-4"
          id="dateFrom"
          label={t("common.from")}
          type="datetime-local"
          value={dateToHtmlDateTimeFormat(filterParams.dateFrom)}
          onChange={(e) => {
            const newValue = moment(e.target.value);
            if (newValue.isValid()) {
              setFilterParams((prev) => {
                return { ...prev, dateFrom: newValue.toDate() };
              });
            }
          }}
        />
        <RntInput
          className="max-w-[320px] lg:max-w-[210px] lg:mr-8"
          id="dateTo"
          label={t("common.to")}
          type="datetime-local"
          value={dateToHtmlDateTimeFormat(filterParams.dateTo)}
          onChange={(e) => {
            const newValue = moment(e.target.value);
            if (newValue.isValid()) {
              setFilterParams((prev) => {
                return { ...prev, dateTo: newValue.toDate() };
              });
            }
          }}
        />

        <div className="flex items-end">
          <RntSelect
            className="w-36 sm:w-40 max-xl:mt-4 mr-8"
            id="sort"
            readOnly={false}
            value={filterParams.statusFilterBy ?? ""}
            onChange={(e) => {
              setFilterParams((prev) => {
                return { ...prev, statusFilterBy: e.target.value };
              });
            }}
          >
            {statusFilters.map((i) => (
              <option key={i.key} value={i.key}>
                {i.value}
              </option>
            ))}
          </RntSelect>

          <RntButton
            className="w-36 sm:w-40"
            // disabled={searchButtonDisabled}
            onClick={() => handleSearchClick()}
          >
            {t("common.search")}
          </RntButton>
        </div>
      </div>

      <table className="mt-12 w-full table-auto border-spacing-2 max-lg:hidden">
        <thead className="mb-2">
          <tr>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName}></th>
            <th className={headerSpanClassName} colSpan={2}>
              <div className="flex flex-col text-rentality-secondary-shade">
                {t_th("guest_payments")}
                <span className="w-full h-1 border-b-2 border-[#24D8D4]" />
              </div>
            </th>
            <th className={headerSpanClassName} colSpan={3}>
              <div className="flex flex-col text-rentality-button-medium">
                {t_th("host_earnings")}
                <span className="w-full h-1 border-b-2 border-[#7f5ee7]" />
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
          {filteredTransactions
            .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
            .map((transaction) => {
              //const itemNumber = currentPage * itemsPerPage + index;
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
        {filteredTransactions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((transaction) => {
          return (
            <TransactionHistoryMobileCard key={transaction.transHistoryId} isHost={isHost} transaction={transaction} />
          );
        })}
      </div>
      <div id="pagination">
        <ReactPaginate
          previousLabel={"←"}
          nextLabel={"→"}
          breakLabel={"..."}
          breakClassName={""}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          containerClassName={"flex absolute bottom-4 right-4 mx-4 text-gray-400"}
          activeClassName={"bg-status-pending text-white rounded-full px-2"}
        />
      </div>
    </div>
  );
}
