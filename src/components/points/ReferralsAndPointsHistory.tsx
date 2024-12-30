import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import ReferralsAndPointsHistoryTable from "@/components/points/ReferralsAndPointsHistoryTable";
import usePointsHistory from "@/hooks/points/usePointsHistory";

export default function ReferralsAndPointsHistory() {
  const { t } = useTranslation();
  const itemsPerPage = 4;
  const { isLoading, data, fetchData } = usePointsHistory();

  async function fetchDataForPage(page: number) {
    await fetchData(page, itemsPerPage);
  }

  useEffect(() => {
    fetchData(1, itemsPerPage);
  }, [fetchData]);

  return (
    <div className="mt-4 w-full rounded-lg bg-rentality-bg-left-sidebar p-3">
      <p className="text-rentality-secondary">{t("referrals_and_point.section_points_history")}</p>
      <PaginationWrapper currentPage={data.currentPage} totalPages={data.totalPageCount} selectPage={fetchDataForPage}>
        <ReferralsAndPointsHistoryTable isLoading={isLoading} data={data.data} />
      </PaginationWrapper>
    </div>
  );
}
