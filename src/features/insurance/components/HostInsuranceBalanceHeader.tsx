import { useTranslation } from "react-i18next";
import Image from "next/image";
import React from "react";
import useFetchHostInsuranceBalance from "@/features/insurance/hooks/useFetchHostInsuranceBalance";
import RntSuspense from "@/components/common/rntSuspense";

export default function HostInsuranceBalanceHeader() {
  const { isLoading, data } = useFetchHostInsuranceBalance();
  const { t } = useTranslation();

  return (
    <RntSuspense isLoading={isLoading}>
      <div
        className="ml-[116px] hidden items-center rounded-md border border-gray-500 px-4 py-2 hover:border-gray-400 xl:flex"
      >
        <Image src={"/images/icons/menu/ic_insurance.svg"} width={47} height={47} alt="" className="mr-2 h-7 w-7" />
        <div className="ml-0.5 flex items-center">
          {t("referrals_and_point.insurance_balance")}
          <span className="px-1 font-semibold text-rentality-secondary">${data.toString()}</span>
        </div>
      </div>
    </RntSuspense>
  );
}