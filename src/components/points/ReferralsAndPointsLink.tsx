import { useTranslation } from "react-i18next";
import React from "react";
import imgCopy from "@/images/ic_copy_white_24dp.svg";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";
import RntInputTransparent from "@/components/common/rntInputTransparent";

export default function ReferralsAndPointsLink() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div className="flex">
        <p className="text-rentality-secondary">{t("referrals_and_point.section_referral_link")}</p>
        <i className="fi fi-rs-info ml-3 cursor-pointer text-rentality-secondary"></i>
      </div>
      <div className="mt-4 items-center justify-start md:flex">
        <div className="w-full max-md:ml-5 md:w-1/3">{t("referrals_and_point.copy_referral_link")}</div>
        <div className="flex md:w-2/3">
          <RntInputTransparent
            className="w-[75%] md:mr-4 md:w-[70%]"
            style={{ color: "white" }}
            readOnly={true}
            type="text"
            value={"https://app.rentality.xyz/320589"}
            // value={formInputEmail}
            // onChange={handleEmailChange}
          />
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
      <div className="mt-4 items-center justify-start md:flex">
        <div className="w-full max-md:ml-5 md:w-1/3">{t("referrals_and_point.referral_code")}</div>
        <div className="flex md:w-2/3">
          <RntInputTransparent
            className="w-[75%] md:mr-4 md:w-[70%]"
            style={{ color: "white" }}
            readOnly={true}
            type="text"
            value={"320589"}
            // value={formInputEmail}
            // onChange={handleEmailChange}
          />
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
    </div>
  );
}