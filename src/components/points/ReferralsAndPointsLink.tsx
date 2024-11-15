import { useTranslation } from "react-i18next";
import React from "react";
import imgCopy from "@/images/ic_copy_white_24dp.svg";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";
import bgInput from "@/images/bg_input.png";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";

export default function ReferralsAndPointsLink() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div className="flex">
        <p className="text-rentality-secondary">{t("referrals_and_point.section_referral_link")}</p>
        <i className="fi fi-rs-info ml-3 cursor-pointer text-rentality-secondary"></i>
      </div>
      <div className="mx-2 mt-4 flex items-center justify-start">
        <div className="w-1/3">{t("referrals_and_point.copy_referral_link")}</div>
        <div className="relative mx-4 w-[45%] px-4 py-3">
          <p className="relative z-10 px-2">https://app.rentality.xyz/320589</p>
          <Image src={bgInput} alt="" className="absolute left-0 top-0 h-full w-full rounded-full" />
        </div>
        <RntButton
          className="ml-auto flex w-16 items-center justify-center text-white md:w-36"
          // onClick={() => copyToClipboard(tripInfo.guest.walletAddress)}
        >
          <Image src={imgCopy} alt="" className="h-5 w-5 md:mr-1" />
          <div className="ml-0.5 flex">
            <span className="max-md:hidden">Copy</span>
            <span className="ml-4 max-md:hidden">●</span>
          </div>
        </RntButton>
      </div>
      <div className="mx-2 mt-4 flex items-center justify-start">
        <div className="w-1/3">{t("referrals_and_point.referral_code")}</div>
        <div className="relative mx-4 w-[45%] px-4 py-3">
          <p className="relative z-10 px-2">320589</p>
          <Image src={bgInput} alt="" className="absolute left-0 top-0 h-full w-full rounded-full" />
        </div>
        <RntButton
          className="ml-auto flex w-16 items-center justify-center text-white md:w-36"
          // onClick={() => copyToClipboard(tripInfo.guest.walletAddress)}
        >
          <Image src={imgCopy} alt="" className="h-5 w-5 md:mr-1" />
          <div className="ml-0.5 flex">
            <span className="max-md:hidden">Copy</span>
            <span className="ml-4 max-md:hidden">●</span>
          </div>
        </RntButton>
      </div>
    </div>
  );
}
