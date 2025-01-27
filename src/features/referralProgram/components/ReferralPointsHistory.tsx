import { useTranslation } from "react-i18next";
import React from "react";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import ReferralPointsHistoryTable from "@/features/referralProgram/components/ReferralPointsHistoryTable";
import usePointsHistory from "@/features/referralProgram/hooks/usePointsHistory";

export default function ReferralPointsHistory() {
  const itemsPerPage = 4;
  const { isLoading, data, fetchData } = usePointsHistory(1, itemsPerPage);
  const { t } = useTranslation();

  async function fetchDataForPage(page: number) {
    await fetchData(page, itemsPerPage);
  }

  return (
    <div className="w-full rounded-lg bg-rentality-bg-left-sidebar p-3">
      <p className="text-rentality-secondary">{t("referrals_and_point.section_points_history")}</p>
      <PaginationWrapper currentPage={data.currentPage} totalPages={data.totalPageCount} selectPage={fetchDataForPage}>
        <ReferralPointsHistoryTable isLoading={isLoading} data={data.pageData} />
      </PaginationWrapper>
    </div>
  );
}
