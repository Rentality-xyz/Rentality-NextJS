import React, { useEffect, useState } from "react";
import { TFunction } from "@/utils/i18n";
import moment from "moment";
import useTransactionHistory, { TransactionHistoryFilters } from "@/hooks/transaction_history/useTransactionHistory";
import PaginationWrapper from "../common/PaginationWrapper";
import TransactionHistoryTable from "./TransactionHistoryTable";
import TransactionHistoryFiltersComponent from "./TransactionHistoryFiltersComponent";

type TransactionHistoryContentProps = {
  isHost: boolean;
  t: TFunction;
};

const defaultFilters: TransactionHistoryFilters = {
  dateFrom: moment({ day: 1, hour: 0 }).subtract(1, "month").toDate(),
  dateTo: moment({ day: 1, hour: 0 }).add(6, "month").toDate(),
};

export default function TransactionHistoryContent({ isHost, t }: TransactionHistoryContentProps) {
  const itemsPerPage = 5;
  const [filters, setFilters] = useState<TransactionHistoryFilters>(defaultFilters);
  const { isLoading, data, fetchData } = useTransactionHistory(isHost);

  async function handleApplyFilters(filters: TransactionHistoryFilters) {
    setFilters(filters);
    await fetchData(filters, 1, itemsPerPage);
  }

  async function fetchDataForPage(page: number) {
    await fetchData(filters, page, itemsPerPage);
  }

  useEffect(() => {
    fetchData(defaultFilters, 1, itemsPerPage);
  }, [fetchData]);

  return (
    <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
      <TransactionHistoryFiltersComponent defaultFilters={defaultFilters} onApply={handleApplyFilters} />
      <PaginationWrapper currentPage={data.currentPage} totalPages={data.totalPageCount} selectPage={fetchDataForPage}>
        <TransactionHistoryTable isLoading={isLoading} data={data.data} isHost={isHost} />
      </PaginationWrapper>
    </div>
  );
}
