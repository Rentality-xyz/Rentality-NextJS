import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RntButton from "@/components/common/rntButton";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";
import RntButtonTransparent from "@/components/common/rntButtonTransparent";
import imgCircleBtn from "@/images/img_circle_for_transparent_btn.svg";
import Image from "next/image";
import useGetInvestments from "@/hooks/guest/useGetInvestments";
import InvestCar from "@/features/invest/components/investCar";
import { useRouter } from "next/navigation";

type InvestContentProps = {
  isHost: boolean;
};

export default function InvestContent({ isHost }: InvestContentProps) {
  const { t } = useTranslation();
  const { investments, updateData, handleInvest, address, handleStartHosting, handleClaimIncome } = useGetInvestments();
  const router = useRouter();
  const handleCreateInvest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await router.push("/host/create_invest");
  };

  return (
    <div className="mt-8">
      {isHost && (
        <RntButton className="mb-6 flex w-60 items-center justify-center" onClick={handleCreateInvest}>
          <div className="ml-0.5 flex">
            {t("invest.btn_create_investment")}
            <span className="ml-4">●</span>
          </div>
        </RntButton>
      )}

      <ScrollingHorizontally>
        <RntButtonTransparent
          className="min-w-[160px]"
          // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex items-center justify-center text-white">
            <span className="ml-4 w-full">{t("invest.btn_all_assets")}</span>
            <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
          </div>
        </RntButtonTransparent>
        <RntButtonTransparent
          className="min-w-[240px]"
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
              className="min-w-[208px]"
              // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex items-center justify-center text-white">
                <span className="ml-4 w-full">{t("invest.btn_host_fully_tokenized")}</span>
                <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
              </div>
            </RntButtonTransparent>
            <RntButtonTransparent
              className="min-w-[224px]"
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
              className="min-w-[224px]"
              // onClick={handleClickOpenDeliveryLocation}
            >
              <div className="flex items-center justify-center text-white">
                <span className="ml-4 w-full">{t("invest.btn_guest_my_investments")}</span>
                <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
              </div>
            </RntButtonTransparent>
            <RntButtonTransparent
              className="min-w-[208px]"
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
          className="min-w-[208px]"
          // onClick={handleClickOpenDeliveryLocation}
        >
          <div className="flex items-center justify-center text-white">
            <span className="ml-4 w-full">{t("invest.btn_actually_listed")}</span>
            <Image src={imgCircleBtn} alt="" className="ml-auto mr-4" />
          </div>
        </RntButtonTransparent>
      </ScrollingHorizontally>

      {investments.map((value) => {
        return (
          <InvestCar
            isHost={isHost}
            key={value.investment.investmentId as unknown as number}
            searchInfo={value}
            handleInvest={handleInvest}
            isCreator={value.investment.creator === address}
            handleStartHosting={handleStartHosting}
            handleClaimIncome={handleClaimIncome}
          />
        );
      })}
    </div>
  );
}
