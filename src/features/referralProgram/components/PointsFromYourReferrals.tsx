//TODO translate
import { useTranslation } from "react-i18next";
import Image from "next/image";
import React from "react";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import PointsFromYourReferralsTable from "@/features/referralProgram/components/PointsFromYourReferralsTable";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import RntButton from "@/components/common/rntButton";
import usePointsFromYourReferrals from "../hooks/usePointsFromYourReferrals";

export default function PointsFromYourReferrals() {
  const itemsPerPage = 4;
  const { isLoading, isPending, readyToClaim, data, fetchData, claimPoints } = usePointsFromYourReferrals();
  const { t } = useTranslation();

  async function fetchDataForPage(page: number) {
    await fetchData(page, itemsPerPage);
  }

  async function handleClaimPointsClick() {
    await claimPoints();
  }

  return (
    <div className="rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div className="items-center sm:flex">
        <div className="flex items-center">
          <p className="text-rentality-secondary">{t("referrals_and_point.section_points_your_referrals")}</p>
        </div>
        <RntButton
          className="flex w-full items-center justify-center text-white max-sm:mt-4 sm:ml-auto sm:w-60 2xl:w-64"
          disabled={readyToClaim === 0}
          onClick={handleClaimPointsClick}
        >
          <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
          <div className="ml-0.5 flex">
            {isPending ? (
              <>Loading...</>
            ) : (
              <>
                Claim <span className="px-1 font-semibold text-rentality-star-point">{readyToClaim.toString()}</span>{" "}
                points
                <span className="ml-4">●</span>
              </>
            )}
          </div>
        </RntButton>
      </div>
      <PaginationWrapper currentPage={data.currentPage} totalPages={data.totalPageCount} selectPage={fetchDataForPage}>
        <PointsFromYourReferralsTable isLoading={isLoading} data={data.data} />
      </PaginationWrapper>
    </div>
  );
}
