import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React from "react";
import ReferralLinks from "../components/ReferralLinks";
import OwnReferralPoints from "../components/OwnReferralPoints";
import PointsFromYourReferrals from "../components/PointsFromYourReferrals";
import ReferralPointsHistory from "../components/ReferralPointsHistory";
import UserBalance from "../components/UserBalance";
import NetworkBaseGuard from "@/components/common/NetworkBaseGuard";

export default function ReferralPageContent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("referrals_and_point.title")} />
        <div className="mt-2 flex flex-col gap-4">
          <p className="ml-4">{t("referrals_and_point.collect_and_claim_points")}</p>
          <UserBalance />
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex flex-col gap-4 xl:w-1/2">
              <ReferralLinks />
              <OwnReferralPoints />
            </div>
            <div className="flex flex-col gap-4 xl:w-1/2">
              <PointsFromYourReferrals />
              <ReferralPointsHistory />
            </div>
          </div>
        </div>
    </>
  );
}
