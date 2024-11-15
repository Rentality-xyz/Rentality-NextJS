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
      <div className="flex items-center">
        <div className="flex items-center">
          <p className="text-rentality-secondary">{t("referrals_and_point.section_points_your_referrals")}</p>
          <i className="fi fi-rs-info ml-3 cursor-pointer text-rentality-secondary"></i>
        </div>
        <RntButton
          className="ml-auto mr-2 flex w-16 items-center justify-center text-white md:w-64"
          // onClick={() => copyToClipboard(tripInfo.guest.walletAddress)}
        >
          <Image src={icStarPointsYellow} alt="" className="h-7 w-7 md:mr-2" />
          <div className="ml-0.5 flex">
            <span className="max-md:hidden">
              Claim <span className="text-rentality-star-point font-semibold">1850</span> points
            </span>
            <span className="ml-4 max-md:hidden">●</span>
          </div>
        </RntButton>
        {/*<div className="ml-auto mr-2 flex items-center">*/}
        {/*  <p className="w-fit rounded-lg border border-rentality-button-medium px-3 py-0.5 text-rentality-secondary">*/}
        {/*    Ready to claim <span className="text-rentality-star-point">1850</span> points*/}
        {/*  </p>*/}
        {/*  <i className="fi fi-rs-info ml-2 cursor-pointer text-rentality-secondary"></i>*/}
        {/*</div>*/}
      </div>
      <PaginationWrapper currentPage={1} totalPages={5} selectPage={1}>
        <ReferralsAndPointsFromYourReferralsTable />
      </PaginationWrapper>
    </div>
  );
}
