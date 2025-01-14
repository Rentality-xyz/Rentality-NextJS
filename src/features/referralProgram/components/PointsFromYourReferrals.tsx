import { useTranslation } from "react-i18next";
import Image from "next/image";
import React, { useEffect } from "react";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import PointsFromYourReferralsTable from "@/features/referralProgram/components/PointsFromYourReferralsTable";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import RntButton from "@/components/common/rntButton";
import usePointsFromYourReferrals from "@/features/referralProgram/hooks/usePointsFromYourReferrals";

export default function PointsFromYourReferrals() {
  const { t } = useTranslation();
  const itemsPerPage = 4;
  const { isLoading, data, fetchData, claimAllReferralPoints } = usePointsFromYourReferrals();

  async function fetchDataForPage(page: number) {
    await fetchData(page, itemsPerPage);
  }

  async function claimPoints() {
    await claimAllReferralPoints();
  }

  useEffect(() => {
    fetchData(1, itemsPerPage);
  }, [fetchData]);

  return (
    <div className="rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div className="items-center sm:flex">
        <div className="flex items-center">
          <p className="text-rentality-secondary">{t("referrals_and_point.section_points_your_referrals")}</p>
        </div>
        <RntButton
          className="flex w-full items-center justify-center text-white max-sm:mt-4 sm:ml-auto sm:w-60 2xl:w-64"
          disabled={data.totalReadyToClaim === 0}
          onClick={() => claimPoints()}
        >
          <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
          <div className="ml-0.5 flex">
            Claim <span className="px-1 font-semibold text-rentality-star-point">{data.totalReadyToClaim}</span> points
            <span className="ml-4">●</span>
          </div>
        </RntButton>
      </div>
      <PaginationWrapper currentPage={data.currentPage} totalPages={data.totalPageCount} selectPage={fetchDataForPage}>
        <PointsFromYourReferralsTable isLoading={isLoading} data={data.data} />
      </PaginationWrapper>
    </div>
  );
}
