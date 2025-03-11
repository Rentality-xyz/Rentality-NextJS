import { useTranslation } from "react-i18next";
import React from "react";
import Image from "next/image";
import RntButton from "@/components/common/rntButton";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { copyToClipboard } from "@/utils/clipboard";
import { isEmpty } from "@/utils/string";
import useFetchReferralLinks from "../hooks/useFetchReferralLinks";

export default function ReferralLinks() {
  const { data } = useFetchReferralLinks();
  const { t } = useTranslation();
  const { inviteHash, usedInviteHash } = data;

  const inviteLink = !isEmpty(inviteHash)
    ? new URL(`/referralLink/${inviteHash}`, window.location.origin).toString()
    : "";
  const inviteCode = !isEmpty(inviteHash) ? (inviteHash.startsWith("0x") ? inviteHash.slice(2) : inviteHash) : "";

  return (
    <div className="rounded-lg bg-rentality-bg-left-sidebar p-3">
      <div className="flex">
        <p className="text-rentality-secondary">{t("referrals_and_point.section_referral_link")}</p>
      </div>
      <div className="mt-4 items-center justify-start md:flex">
        <div className="w-full max-md:ml-5 md:w-1/3">{t("referrals_and_point.send_referral_link")}</div>
        <div className="flex md:w-2/3">
          <RntInputTransparent
            className="w-[75%] md:mr-4 md:w-[70%]"
            style={{ color: "white" }}
            readOnly={true}
            type="text"
            value={inviteCode}
          />
          <RntButton
            className="ml-auto flex w-16 items-center justify-center text-white md:w-36"
            disabled={!inviteHash}
            isVisibleCircle={false}
            onClick={() => copyToClipboard(inviteLink)}
          >
            <Image
              src={"/images/icons/ic_copy_white_24dp.svg"}
              width={24}
              height={24}
              alt=""
              className="h-5 w-5 md:mr-1"
            />
            <div className="ml-0.5 flex">
              <span className="max-md:hidden">Copy</span>
            </div>
          </RntButton>
        </div>
      </div>
      <div className="mt-4 items-center justify-start md:flex">
        <div className="w-full max-md:ml-5 md:w-1/3">{t("referrals_and_point.referral_code")}</div>
        <div className="flex md:w-2/3">
          <RntInputTransparent
            className="w-full md:mr-4"
            style={{ color: "white" }}
            readOnly={true}
            type="text"
            value={usedInviteHash}
          />
        </div>
      </div>
    </div>
  );
}
