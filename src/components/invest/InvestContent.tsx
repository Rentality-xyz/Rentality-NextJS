import React from "react";
import { useTranslation } from "react-i18next";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import RntButton from "@/components/common/rntButton";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";

type InvestContentProps = {
  isHost: boolean;
};

const ccsDivider = "absolute right-[-5px] top-1/2 h-[80%] w-px translate-y-[-50%] bg-gray-500";

export default function InvestContent({ isHost }: InvestContentProps) {
  const { t } = useTranslation();
  const test = isHost ? t("invest.host_management") : t("invest.your_expected_earnings");

  return (
    <div className="mt-8">
      {isHost && (
        <RntButton
          className="mb-6 flex items-center justify-center"
          // onClick={() => claimPoints()}
        >
          <div className="ml-0.5 flex">
            {t("invest.btn_create_investment")}
            <span className="ml-4">●</span>
          </div>
        </RntButton>
      )}

      <ScrollingHorizontally>
        <RntButtonTransparent
        // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex w-56 justify-center text-white">
            {t("invest.btn_all_assets")}
            <span className="ml-4">●</span>
          </div>
        </RntButtonTransparent>
        <RntButtonTransparent
        // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex w-56 justify-center text-white">
            {t("invest.btn_available_to_invest")}
            <span className="ml-4">●</span>
          </div>
        </RntButtonTransparent>
        {isHost ? (
          <>
            <RntButtonTransparent
            // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex w-56 justify-center text-white">
                {t("invest.btn_host_fully_tokenized")}
                <span className="ml-4">●</span>
              </div>
            </RntButtonTransparent>
            <RntButtonTransparent
            // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex w-56 justify-center text-white">
                {t("invest.btn_host_ready_for_listing")}
                <span className="ml-4">●</span>
              </div>
            </RntButtonTransparent>
          </>
        ) : (
          <>
            <RntButtonTransparent
            // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex w-56 justify-center text-white">
                {t("invest.btn_guest_my_investments")}
                <span className="ml-4">●</span>
              </div>
            </RntButtonTransparent>
            <RntButtonTransparent
            // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex w-56 justify-center text-white">
                {t("invest.btn_guest_ready_to_claim")}
                <span className="ml-4">●</span>
              </div>
            </RntButtonTransparent>
          </>
        )}
        <RntButtonTransparent
        // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex w-56 justify-center text-white">
            {t("invest.btn_actually_listed")}
            <span className="ml-4">●</span>
          </div>
        </RntButtonTransparent>
      </ScrollingHorizontally>

      <div className="mt-6 flex w-full flex-col rounded-xl bg-rentality-bg-left-sidebar">
        <div className="w-full rounded-t-xl bg-blue-600 py-1 pl-4">
          Available to Invest | Waiting for full tokenization
        </div>
        <div className="grid h-[200px] w-full grid-cols-4 gap-2">
          <div style={{ backgroundImage: `url(${icStarPointsYellow})` }} className="p-2">
            01
          </div>
          <div className="relative p-2">
            02
            <div className={ccsDivider}></div>
          </div>
          <div className="relative p-2 text-center">
            {t("invest.tokenization")}
            <div className={ccsDivider}></div>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-rentality-secondary">{test}</span>
            40% {t("invest.from_each_trip")}
          </div>
        </div>
      </div>
    </div>
  );
}
