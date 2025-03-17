import React, { useEffect, useState } from "react";
import moment from "moment";
import useTransactionHistory, {
  TransactionHistoryFiltersType,
} from "@/features/transactionHistory/hooks/useTransactionHistory";
import PaginationWrapper from "../../../components/common/PaginationWrapper";
import { useTranslation } from "react-i18next";
import useUserMode from "@/hooks/useUserMode";
import PageTitle from "@/components/pageTitle/pageTitle";
import TransactionHistoryFilters from "../components/TransactionHistoryFilters";
import TransactionHistoryTable from "../components/TransactionHistoryTable";

const defaultFilters: TransactionHistoryFiltersType = {
  dateFrom: moment({ day: 1, hour: 0 }).subtract(1, "month").toDate(),
  dateTo: moment({ day: 1, hour: 0 }).add(6, "month").toDate(),
};

function TransactionHistoryPageContent() {
  const { userMode, isHost } = useUserMode();

  const itemsPerPage = 5;
  const [filters, setFilters] = useState<TransactionHistoryFiltersType>(defaultFilters);
  const { isLoading, data, fetchData } = useTransactionHistory(isHost(userMode));
  const { t } = useTranslation();

  async function handleApplyFilters(filters: TransactionHistoryFiltersType) {
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
    <>
      <PageTitle title={t("transaction_history.title")} />
      <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-rentality-bg p-4 pb-8">
        <TransactionHistoryFilters defaultFilters={defaultFilters} onApply={handleApplyFilters} />
        <PaginationWrapper
          currentPage={data.currentPage}
          totalPages={data.totalPageCount}
          selectPage={fetchDataForPage}
        >
          <TransactionHistoryTable isLoading={isLoading} data={data.data} isHost={isHost(userMode)} />
        </PaginationWrapper>
      </div>
    </>
  );
}

export default TransactionHistoryPageContent;
