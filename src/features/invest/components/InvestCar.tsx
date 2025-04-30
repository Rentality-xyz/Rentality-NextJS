import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { cn } from "@/utils";
import { InvestmentInfoWithMetadata, InvestStatus } from "@/features/invest/models/investmentInfo";
import Link from "next/link";
import { Result } from "@/model/utils/result";
import {
  getCarListingStatus,
  getColorInvestmentStatus,
  getInvestmentStatus,
  getTxtInvestmentListingStatus,
} from "../utils";
import HostInvestBlock from "./HostInvestBlock";
import GuestInvestBlock from "./GuestInvestBlock";
import TokenizationBalance from "./TokenizationBalance";
import Income from "./Income";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { formatFloatInput } from "@/utils/formatFloatInput";

const ccsDividerVert = "max-2xl:hidden absolute right-[-5px] top-1/2 h-[80%] w-px translate-y-[-50%] bg-gray-500";
const ccsDividerHor = "2xl:hidden absolute bottom-[-10px] left-[5%] h-px w-[90%] translate-y-[-50%] bg-gray-500";

export default function InvestCar({
  isHost,
  searchInfo,
  handleInvest,
  isPendingInvesting,
  handleStartHosting,
  handleClaimIncome,
}: {
  isHost: boolean;
  searchInfo: InvestmentInfoWithMetadata;
  handleInvest: (amount: number, investId: number) => void;
  isPendingInvesting: boolean;
  handleStartHosting: (investId: number) => Promise<Result<boolean>>;
  handleClaimIncome: (investId: number) => Promise<Result<boolean>>;
}) {
  const { t } = useTranslation();
  const ethereumInfo = useEthereum();
  const [investmentAmount, setInvestmentAmount] = useState<number | string>(0);
  const { showDialog, hideDialogs } = useRntDialogs();

  const isCreator = searchInfo.investment.creator === ethereumInfo?.walletAddress;

  const handleChangeInvestmentAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxAmount = searchInfo.investment.investment.priceInCurrency - searchInfo.investment.payedInCurrency;
    let value = e.target.value;
    value = formatFloatInput(value);

    if (parseFloat(value) > maxAmount) {
      value = maxAmount.toString();
    }

    setInvestmentAmount(value);
  };
  const listingStatus = getCarListingStatus(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost, t);

  function getMessageInfo() {
    return listingStatus.investStatus === InvestStatus.ActuallyListed && searchInfo.investment.myIncome > 0
      ? t("invest.info_message.actually_listed_claim")
      : listingStatus.investStatus === InvestStatus.ActuallyListed
        ? t("invest.info_message.actually_listed_expect")
        : listingStatus.investStatus === InvestStatus.ListingProgress
          ? t("invest.info_message.listing_progress")
          : listingStatus.investStatus === InvestStatus.WaitingFullTokenization
            ? t("invest.info_message.waiting_full_tokenization")
            : "";
  }

  function handleInfoClick() {
    const message = getMessageInfo();
    if (message !== "") {
      showDialog(message);
    }
  }

  return (
    <div className="mt-4 flex w-full flex-col rounded-xl bg-rentality-bg-left-sidebar">
      <div
        className={cn(
          "w-full rounded-t-xl py-1 pl-4",
          getColorInvestmentStatus(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost)
        )}
      >
        <div className="flex max-mac:flex-col">
          <span>{getInvestmentStatus(searchInfo.investment, t)}</span>
          <span className="mx-2 max-mac:hidden">|</span>
          <span>
            {getTxtInvestmentListingStatus(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost, t)}
          </span>
          <Link
            href={searchInfo.investment.nftUrl}
            target="_blank"
            className="mr-4 cursor-pointer hover:underline mac:ml-auto"
          >
            {t("invest.view_smart_contract")}
          </Link>
        </div>
      </div>
      <div
        style={{ backgroundImage: `url(${searchInfo.metadata.mainImage})` }}
        className="min-h-[212px] w-full bg-cover bg-center bg-no-repeat sm:min-h-[356px] xl:min-h-[514px] 2xl:min-h-[324px] mac:min-h-[366px] fullHD:min-h-[432px]"
      ></div>
      <div className="flex h-full w-full grid-cols-[1fr_0.5fr_0.5fr] flex-col gap-2 2xl:grid">
        <div className="relative flex flex-col justify-between p-2">
          <div>
            <p className="text-xl font-bold">
              {`${searchInfo.investment.investment.car.brand} ${searchInfo.investment.investment.car.model} ${searchInfo.investment.investment.car.yearOfProduction}`}
            </p>
          </div>
          <div>
            {isHost ? (
              <HostInvestBlock
                isCreator={isCreator}
                investment={searchInfo.investment}
                handleStartHosting={handleStartHosting}
                t={t}
              />
            ) : (
              <GuestInvestBlock
                investment={searchInfo.investment}
                investmentAmount={investmentAmount}
                handleInvest={handleInvest}
                isPendingInvesting={isPendingInvesting}
                handleChangeInvestmentAmount={handleChangeInvestmentAmount}
                handleClaimIncome={handleClaimIncome}
                t={t}
              />
            )}
          </div>
          <div>
            <p className="mt-8">{t("invest.listing_status")}</p>
            <p className="flex text-rentality-secondary">
              {listingStatus.message}
              {getMessageInfo() !== "" && (
                <i className="fi fi-rs-info ml-2 cursor-pointer" onClick={handleInfoClick}></i>
              )}
            </p>
          </div>
          <div className={ccsDividerVert}></div>
          <div className={ccsDividerHor}></div>
        </div>
        <div className="relative flex h-full flex-col p-2 text-center max-2xl:py-4 2xl:px-4">
          <p className="text-xl font-semibold max-2xl:mb-4">{t("invest.tokenization")}</p>
          <div className="flex flex-grow flex-col justify-center">
            <p className="text-xl font-bold 2xl:text-2xl">
              ETH: {searchInfo.investment.investment.priceInCurrency.toFixed(6)}
            </p>
            <p className="2xl:text-lg">{t("invest.total_price")}</p>
            <div className="mx-auto my-2 h-0.5 w-[40%] translate-y-[-50%] bg-white sm:w-[70%]"></div>
            <TokenizationBalance
              investment={searchInfo.investment}
              walletAddress={ethereumInfo?.walletAddress ?? ""}
              isHost={isHost}
              t={t}
            />
          </div>
          <div className={ccsDividerVert}></div>
          <div className={ccsDividerHor}></div>
        </div>
        <div className="flex h-full flex-col items-center justify-center p-2 text-center max-2xl:py-4">
          <Income
            investment={searchInfo.investment}
            walletAddress={ethereumInfo?.walletAddress ?? ""}
            isHost={isHost}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
