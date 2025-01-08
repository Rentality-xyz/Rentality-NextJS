import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React from "react";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import ReferralsAndPointsContent from "@/features/referralProgram/components/ReferralsAndPointsContent";

export default function HostReferralPageContent() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("referrals_and_point.title")} />
      <CheckingLoadingAuth>
        <ReferralsAndPointsContent isHost={true} />
      </CheckingLoadingAuth>
    </>
  );
}
