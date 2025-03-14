import PageTitle from "@/components/pageTitle/pageTitle";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import InvestPageContent from "@/features/invest/pages/InvestPageContent";
import { useRouter } from "next/navigation";

export default function HostInvest() {
  const { t } = useTranslation();

  const router = useRouter();
  useEffect(() => {
    router.push("/404");
  }, [router]);

  return (
    <>
      <PageTitle title={t("invest.host_page_title")} />
      <InvestPageContent />
    </>
  );
}
