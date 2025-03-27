import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import InvestPageContent from "@/features/invest/pages/InvestPageContent";
import { useRouter } from "next/navigation";
import useFeatureFlags from "@/features/featureFlags/hooks/useFeatureFlags";
import { FEATURE_FLAGS } from "@/features/featureFlags/utils";

export default function GuestInvest() {
  const router = useRouter();
  const { hasFeatureFlag } = useFeatureFlags();
  const { t } = useTranslation();

  useEffect(() => {
    hasFeatureFlag(FEATURE_FLAGS.FF_INVESTMENTS).then((hasInvestmentFeatureFlag: boolean) => {
      if (!hasInvestmentFeatureFlag) {
        router.push("/404");
      }
    });
  }, [hasFeatureFlag, router]);

  return (
    <>
      <PageTitle title={t("invest.guest_page_title")} />
      <InvestPageContent isHost={false} />
    </>
  );
}
