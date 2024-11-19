import { useTranslation } from "react-i18next";
import Image from "next/image";
import icStarPointsWhite from "@/images/ic_star_points_white.svg";
import React from "react";
import TransactionHistoryTable from "@/components/transaction_history/TransactionHistoryTable";
import PaginationWrapper from "@/components/common/PaginationWrapper";
import ReferralsAndPointsFromYourReferralsTable from "@/components/points/ReferralsAndPointsFromYourReferralsTable";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import RntButton from "@/components/common/rntButton";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";

export default function ReferralsAndPointsFromYourReferrals() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div className="items-center sm:flex">
        <div className="flex items-center">
          <p className="text-rentality-secondary">{t("referrals_and_point.section_points_your_referrals")}</p>
          <i className="fi fi-rs-info ml-3 cursor-pointer text-rentality-secondary"></i>
        </div>
        <RntButton
          className="flex w-full items-center justify-center text-white max-sm:mt-4 sm:ml-auto sm:w-60 2xl:w-64"
          // onClick={() => copyToClipboard(tripInfo.guest.walletAddress)}
        >
          <Image src={icStarPointsYellow} alt="" className="mr-2 h-7 w-7" />
          <div className="ml-0.5 flex">
            Claim <span className="text-rentality-star-point px-1 font-semibold">1850</span> points
            <span className="ml-4">●</span>
          </div>
        </RntButton>
      </div>
      <PaginationWrapper currentPage={1} totalPages={5} selectPage={1}>
        <ReferralsAndPointsFromYourReferralsTable />
      </PaginationWrapper>
    </div>
  );
}
