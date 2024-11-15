import { useTranslation } from "react-i18next";
import Image from "next/image";
import icStarPointsWhite from "@/images/ic_star_points_white.svg";
import React from "react";
import ReferralsAndPointsFromYourReferralsTable from "@/components/points/ReferralsAndPointsFromYourReferralsTable";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import ReferralsAndPointsHistoryTable from "@/components/points/ReferralsAndPointsHistoryTable";

export default function ReferralsAndPointsHistory() {
  const { t } = useTranslation();

  return (
    <div className="mt-4 w-full rounded-lg bg-rentality-bg-left-sidebar p-3">
      <p className="text-rentality-secondary">{t("referrals_and_point.section_points_history")}</p>
      <PaginationWrapper currentPage={1} totalPages={5} selectPage={1}>
        <ReferralsAndPointsHistoryTable />
      </PaginationWrapper>
    </div>
  );
}
