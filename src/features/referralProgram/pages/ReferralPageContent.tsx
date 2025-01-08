// TODO translate
import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import useReferralProgram from "../hooks/useReferralProgram";
import useClaimMyPoints from "../hooks/useClaimMyPoints";
import Image from "next/image";
import ReferralLinks from "../components/ReferralLinks";
import OwnReferralPoints from "../components/OwnReferralPoints";
import PointsFromYourReferrals from "../components/PointsFromYourReferrals";
import ReferralPointsHistory from "../components/ReferralPointsHistory";
import icStarPointsWhite from "@/images/ic_star_points_white.svg";

export default function ReferralPageContent() {
  const { points, updateData } = useReferralProgram();
  const { readyToClaim } = useClaimMyPoints();
  const { t } = useTranslation();

  useEffect(() => {
    updateData();
  }, [updateData, readyToClaim]);

  return (
    <>
      <PageTitle title={t("referrals_and_point.title")} />
      <CheckingLoadingAuth>
        <p className="ml-4 mt-2">{t("referrals_and_point.collect_and_claim_points")}</p>
        <div className="mt-3 flex w-fit items-center rounded-lg border border-rentality-star-point px-3 py-2 font-['Montserrat',Arial,sans-serif]">
          <Image src={icStarPointsWhite} alt="" className="mr-1 h-[22px]" />
          <p>
            Your Balance <span className="text-rentality-secondary">{points}</span> points
          </p>
        </div>
        <div className="my-4 flex flex-col gap-4 xl:flex-row">
          <div className="xl:flex xl:w-1/2 xl:flex-col">
            <ReferralLinks />
            <OwnReferralPoints />
          </div>
          <div className="xl:flex xl:w-1/2 xl:flex-col">
            <PointsFromYourReferrals />
            <ReferralPointsHistory />
          </div>
        </div>
      </CheckingLoadingAuth>
    </>
  );
}
