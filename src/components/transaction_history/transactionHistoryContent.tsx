import Link from "next/link";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import { dateFormatYearMonthDayTime, dateToHtmlDateTimeFormat } from "@/utils/datetimeFormatters";
import RntInput from "@/components/common/rntInput";
import RntButton from "@/components/common/rntButton";
import React, { useState } from "react";
import RntSelect from "@/components/common/rntSelect";
import ReactPaginate from "react-paginate";
import TransactionHistoryMobileCard from "@/components/transaction_history/transactionHistoryMobileCard";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";

export type SortOptions = {
  [key: string]: string;
};
export type SortOptionKey = keyof SortOptions;

type Props = {
  isHost: boolean;
  transactions: TransactionHistoryInfo[];
  sortOptions: SortOptions;
  t: TFunction;
};

export default function TransactionHistoryContent(props: Props) {
  const dateNow = new Date();
  const t = props.t;
  const t_th: TFunction = (name, options) => {
    return t("transaction_history." + name, options);
  };
  const defaultDateFrom = new Date(dateNow.getTime() + 1 * 60 * 60 * 1000);
  const defaultDateTo = new Date(dateNow.getTime() + 25 * 60 * 60 * 1000);
  const { isHost, transactions } = props;
  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";
  const [sortBy, setSortBy] = useState<SortOptionKey | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState(0); // Текущая страница
  const itemsPerPage = 5; // Количество элементов на странице
  const totalItems = transactions.length; // Общее количество элементов
  const totalPages = Math.ceil(totalItems / itemsPerPage); // Вычисляем общее количество страниц
  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };
  const sortOptions = props.sortOptions;

  function isSortOptionKey(key: PropertyKey): key is SortOptionKey {
    return sortOptions.hasOwnProperty(key);
  }

  const handleSearchClick = async () => {
    // const result = await searchAvailableCars(searchCarRequest);
    // if (result) {
    //     setSortBy(undefined);
    // }
  };

  return (
    <div className="relative w-full min-h-[540px] pb-16 bg-rentality-bg p-4 rounded-2xl mt-5">
      <div className="flex max-lg:flex-col items-center lg:items-end">
        <RntInput
          className="max-w-[320px] lg:max-w-[210px] lg:mr-4"
          id="dateFrom"
          label={t("common.from")}
          type="datetime-local"
          value={dateToHtmlDateTimeFormat(defaultDateFrom)}
          // onChange={handleSearchInputChange}
        />
        <RntInput
          className="max-w-[320px] lg:max-w-[210px] lg:mr-8"
          id="dateTo"
          label={t("common.to")}
          type="datetime-local"
          value={dateToHtmlDateTimeFormat(defaultDateTo)}
          // onChange={handleSearchInputChange}
        />

        <div className="flex items-end">
          <RntSelect
            className="w-36 sm:w-40 max-xl:mt-4 mr-8"
            id="sort"
            readOnly={false}
            value={sortBy ?? ""}
            onChange={(e) => {
              const newValue = e.target.value;
              if (isSortOptionKey(newValue)) {
                setSortBy(newValue);
              }
            }}
          >
            <option className="hidden" value={""} disabled>
              {t_th("status")}
            </option>
            {(Object.keys(sortOptions) as (keyof typeof sortOptions)[]).map((key) => (
              <option key={key} value={key}>
                {sortOptions[key]}
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
          </tr>
        </thead>
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={headerSpanClassName}>{t_th("car")}</th>
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
            <th className={headerSpanClassName}></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {transactions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((transaction) => {
            //const itemNumber = currentPage * itemsPerPage + index;
            const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${transaction.transHistoryId}`;

            return (
              <tr key={transaction.transHistoryId} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{transaction.car}</td>
                <td className={rowSpanClassName}>{getTripStatusTextFromStatus(transaction.status)}</td>
                <td className={rowSpanClassName}>{transaction.days}</td>
                <td className={rowSpanClassName}>{dateFormatYearMonthDayTime(transaction.startDateTime)}</td>
                <td className={rowSpanClassName}>{dateFormatYearMonthDayTime(transaction.endDateTime)}</td>
                <td className={rowSpanClassName}>${transaction.tripPayment}</td>
                <td className={rowSpanClassName}>${transaction.refund}</td>
                <td className={rowSpanClassName}>${transaction.tripEarnings}</td>
                <td className={rowSpanClassName}>${transaction.cancellationFee}</td>
                <td className={rowSpanClassName}>${transaction.reimbursements}</td>
                <td className={rowSpanClassName}>${transaction.rentalityFee}</td>
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
        {transactions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((transaction) => {
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
