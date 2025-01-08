import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import ReferralPointsHistoryTable from "@/features/referralProgram/components/ReferralPointsHistoryTable";
import usePointsHistory from "@/features/referralProgram/hooks/usePointsHistory";

export default function ReferralPointsHistory() {
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
        <ReferralPointsHistoryTable isLoading={isLoading} data={data.data} />
      </PaginationWrapper>
    </div>
  );
}
