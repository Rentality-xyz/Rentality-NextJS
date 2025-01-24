import React from "react";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import imgCircleBtn from "@/images/img_circle_for_transparent_btn.svg";
import Image from "next/image";

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
          className="mb-6 flex w-60 items-center justify-center"
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
          className="w-40"
          // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex items-center justify-center text-white">
            <span className="ml-4 w-full">{t("invest.btn_all_assets")}</span>
            <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
          </div>
        </RntButtonTransparent>
        <RntButtonTransparent
          className="w-60"
          // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex items-center justify-center text-white">
            <span className="ml-4 w-full">{t("invest.btn_available_to_invest")}</span>
            <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
          </div>
        </RntButtonTransparent>
        {isHost ? (
          <>
            <RntButtonTransparent
              className="w-52"
              // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex items-center justify-center text-white">
                <span className="ml-4 w-full">{t("invest.btn_host_fully_tokenized")}</span>
                <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
              </div>
            </RntButtonTransparent>
            <RntButtonTransparent
            // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex items-center justify-center text-white">
                <span className="ml-4 w-full">{t("invest.btn_host_ready_for_listing")}</span>
                <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
              </div>
            </RntButtonTransparent>
          </>
        ) : (
          <>
            <RntButtonTransparent
            // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex items-center justify-center text-white">
                <span className="ml-4 w-full">{t("invest.btn_guest_my_investments")}</span>
                <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
              </div>
            </RntButtonTransparent>
            <RntButtonTransparent
              className="w-52"
              // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex items-center justify-center text-white">
                <span className="ml-4 w-full">{t("invest.btn_guest_ready_to_claim")}</span>
                <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
              </div>
            </RntButtonTransparent>
          </>
        )}
        <RntButtonTransparent
          className="w-52"
          // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex items-center justify-center text-white">
            <span className="ml-4 w-full">{t("invest.btn_actually_listed")}</span>
            <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
          </div>
        </RntButtonTransparent>
      </ScrollingHorizontally>

      <div className="mt-6 flex w-full flex-col rounded-xl bg-rentality-bg-left-sidebar">
        <div className="w-full rounded-t-xl bg-blue-600 py-1 pl-4">
          Available to Invest | Waiting for full tokenization
        </div>
        <div className="grid h-[200px] w-full grid-cols-4 gap-2">
          <div className="border-r bg-[url('../images/car_loading.png')] bg-cover bg-center bg-no-repeat p-2"></div>
          <div className="relative p-2">
            02
            <div className={ccsDivider}></div>
          </div>
          <div className="relative p-2 text-center">
            <p>{t("invest.tokenization")}</p>
            <div className="flex h-full flex-col justify-center">
              <p className="text-lg font-bold leading-none">$80 000</p>
              <p className="leading-snug">Total price</p>
              <div className="mx-auto my-2 h-0.5 w-[60%] translate-y-[-50%] bg-white"></div>
              <p className="text-lg font-bold leading-none text-rentality-secondary">$10 000</p>
              <p className="leading-snug text-rentality-secondary">Balance to be raised</p>
            </div>
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
