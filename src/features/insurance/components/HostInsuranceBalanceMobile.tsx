import { useTranslation } from "react-i18next";
import Image from "next/image";
import React from "react";
import useFetchHostInsuranceBalance from "@/features/insurance/hooks/useFetchHostInsuranceBalance";
import { displayMoneyWithNDigits } from "@/utils/numericFormatters";

const DIGITS = 5

export default function HostInsuranceBalanceMobile() {
  const { isLoading, data } = useFetchHostInsuranceBalance();
  const { t } = useTranslation();

  return (
    <div
      className={"mb-3 flex cursor-pointer items-center hover:underline 2xl:hidden"}
    >
      <Image src={"/images/icons/menu/ic_insurance.svg"} width={42} height={42} alt="" className="" />
      <div className="ml-3 flex">
        {isLoading ? (
          <>{t("referrals_and_point.loading")}</>
        ) : (
          <> {t("referrals_and_point.insurance_balance")} {displayMoneyWithNDigits(data, DIGITS)} ETH</>
        )}
      </div>
    </div>
  );
}