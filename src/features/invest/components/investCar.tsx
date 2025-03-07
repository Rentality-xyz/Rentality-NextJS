import RntButton from "../../../components/common/rntButton";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { cn } from "@/utils";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { dateFormatLongMonthYearDate } from "@/utils/datetimeFormatters";
import moment from "moment";
import { InvestmentInfoWithMetadata } from "@/model/InvestmentInfo";
import { InvestmentInfo } from "@/model/InvestmentInfo";
import Link from "next/link";
import { isUnlimitedMiles } from "@/model/HostCarInfo";

const ccsDividerVert = "max-2xl:hidden absolute right-[-5px] top-1/2 h-[80%] w-px translate-y-[-50%] bg-gray-500";
const ccsDividerHor = "2xl:hidden absolute bottom-[-10px] left-[5%] h-px w-[90%] translate-y-[-50%] bg-gray-500";

export enum InvestStatus {
  Unknown,
  ActuallyListed,
  ReadyListing,
  ListingProgress,
  WaitingFullTokenization,
}

export default function InvestCar({
  isHost,
  searchInfo,
  handleInvest,
  isPendingInvesting,
  isCreator,
  handleStartHosting,
  handleClaimIncome,
}: {
  isHost: boolean;
  searchInfo: InvestmentInfoWithMetadata;
  handleInvest: (amount: number, investId: number) => void;
  isPendingInvesting: boolean;
  isCreator: boolean;
  handleStartHosting: (investId: number) => Promise<void>;
  handleClaimIncome: (investId: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const ethereumInfo = useEthereum();
  const [investmentAmount, setInvestmentAmount] = useState(0);

  const handleChangeInvestmentAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxAmount = searchInfo.investment.investment.priceInUsd;
    const inputInvestmentAmount = e.target.value.replace(/[^\d.]/g, "") || "0"; // Удаляем всё, кроме цифр
    let numericValue = Number.parseFloat(inputInvestmentAmount);

    if (numericValue > maxAmount) {
      numericValue = maxAmount;
    }

    setInvestmentAmount(numericValue);
  };

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
        style={{ backgroundImage: `url(${searchInfo.metadata.image})` }}
        className="min-h-[212px] w-full bg-cover bg-center bg-no-repeat sm:min-h-[356px] xl:min-h-[514px] 2xl:min-h-[324px] mac:min-h-[366px] fullHD:min-h-[432px]"
      ></div>
      <div className="flex h-full w-full grid-cols-[1fr_0.5fr_0.5fr] flex-col gap-2 2xl:grid">
        <div className="relative flex flex-col justify-between p-2">
          <div>
            <p className="text-xl font-bold">
              {`${searchInfo.investment.investment.car.brand} ${searchInfo.investment.investment.car.model} ${searchInfo.investment.investment.car.yearOfProduction}`}
            </p>
            <p className="font-medium text-[#FFFFFF70]">
              {`${searchInfo.investment.investment.car.locationInfo.locationInfo.city}, ${searchInfo.investment.investment.car.locationInfo.locationInfo.state}, ${searchInfo.investment.investment.car.locationInfo.locationInfo.country}`}
            </p>
          </div>
          <div>
            {isHost
              ? getBlocksForHost(isCreator, searchInfo.investment, handleStartHosting, t)
              : getBlocksForGuest(
                  searchInfo.investment,
                  investmentAmount,
                  handleInvest,
                  isPendingInvesting,
                  handleChangeInvestmentAmount,
                  handleClaimIncome,
                  t
                )}
          </div>
          <div>
            <p className="mt-8">{t("invest.listing_status")}</p>
            <p className="text-rentality-secondary">
              {getCarListingStatus(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost, t)}
            </p>
          </div>
          <div className={ccsDividerVert}></div>
          <div className={ccsDividerHor}></div>
        </div>
        <div className="relative flex h-full flex-col p-2 text-center max-2xl:py-4 2xl:px-4">
          <p className="text-xl font-semibold max-2xl:mb-4">{t("invest.tokenization")}</p>
          <div className="flex flex-grow flex-col justify-center">
            <p className="text-xl font-bold 2xl:text-2xl">${searchInfo.investment.investment.priceInUsd}</p>
            <p className="2xl:text-lg">{t("invest.total_price")}</p>
            <div className="mx-auto my-2 h-0.5 w-[40%] translate-y-[-50%] bg-white sm:w-[70%]"></div>
            {getBlockTokenizationBalance(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost, t)}
          </div>
          <div className={ccsDividerVert}></div>
          <div className={ccsDividerHor}></div>
        </div>
        <div className="flex h-full flex-col items-center justify-center p-2 text-center max-2xl:py-4">
          {getBlockIncome(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost, t)}
        </div>
      </div>
    </div>
  );
}

function getBlockTokenizationBalance(
  investment: InvestmentInfo,
  walletAddress: string,
  isHost: boolean,
  t: (key: string) => string
) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);

  return investStatus === InvestStatus.WaitingFullTokenization ? (
    <>
      <p className="text-xl font-bold leading-none text-rentality-secondary 2xl:text-2xl">
        ${(investment.investment.priceInUsd - investment.payedInUsd).toFixed(2)}
      </p>
      <p className="leading-snug text-rentality-secondary 2xl:text-lg">{t("invest.balance_raised")}</p>
    </>
  ) : (
    <>
      <p className="leading-snug text-rentality-secondary 2xl:text-lg">{t("invest.fully_tokenized")}</p>
      {isHost && (
        <p className="mt-4 leading-snug text-[#FFFFFF70]">
          {t("invest.tokens_held_by_investors")
            .replace("{tokens}", String(investment.totalTokens))
            .replace("{investors}", String(investment.totalHolders))}
        </p>
      )}
    </>
  );
}

function getInvestmentStatus(investment: InvestmentInfo, t: (key: string) => string) {
  return investment.investment.priceInUsd <= investment.payedInUsd
    ? t("invest.fully_tokenized")
    : t("invest.available_invest");
}

function getInvestListingStatus(investment: InvestmentInfo, walletAddress: string, isHost: boolean) {
  return investment.listed
    ? InvestStatus.ActuallyListed
    : investment.investment.priceInUsd <= investment.payedInUsd &&
        !investment.listed &&
        investment.creator === walletAddress &&
        isHost
      ? InvestStatus.ReadyListing
      : investment.investment.priceInUsd <= investment.payedInUsd &&
          !investment.listed &&
          investment.creator != walletAddress &&
          !isHost
        ? InvestStatus.ListingProgress
        : investment.investment.priceInUsd > investment.payedInUsd
          ? InvestStatus.WaitingFullTokenization
          : InvestStatus.Unknown;
}

function getTxtInvestmentListingStatus(
  investment: InvestmentInfo,
  walletAddress: string,
  isHost: boolean,
  t: (key: string) => string
) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);
  return investStatus === InvestStatus.ActuallyListed
    ? t("invest.actually_listed")
    : investStatus === InvestStatus.ReadyListing
      ? t("invest.ready_listing")
      : investStatus === InvestStatus.ListingProgress
        ? t("invest.listing_progress")
        : investStatus === InvestStatus.WaitingFullTokenization
          ? t("invest.waiting_full_tokenization")
          : t("invest.unknown");
}

function getColorInvestmentStatus(investment: InvestmentInfo, walletAddress: string, isHost: boolean) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);
  return investStatus === InvestStatus.ActuallyListed
    ? "bg-[#7355D7]"
    : investStatus === InvestStatus.ReadyListing || investStatus === InvestStatus.ListingProgress
      ? "bg-[#A21CAF]"
      : "bg-[#2563EB]";
}

function getBlocksForGuest(
  investment: InvestmentInfo,
  investmentAmount: number,
  handleInvest: (amount: number, investId: number) => void,
  isPendingInvesting: boolean,
  handleChangeInvestmentAmount: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleClaimIncome: (investId: number) => Promise<void>,
  t: (key: string) => string
) {
  const myIncome = investment.myIncome > 0 ? investment.myIncome / 100 : investment.myIncome;
  return (
    <>
      {blockStakeInAssetForGuest(investment.myTokens, investment.myInvestingSum, t)}
      {!investment.listed && !investment.investment.inProgress ? (
        blockExpectCompletedTripsForGuest(t)
      ) : investment.myIncome > 0 ? (
        btnClaimEarningsForGuest(myIncome, investment.investmentId, handleClaimIncome, t)
      ) : investment.investment.inProgress ? (
        blockInvestNowForGuest(
          investment.investmentId,
          investmentAmount,
          handleInvest,
          isPendingInvesting,
          handleChangeInvestmentAmount,
          t
        )
      ) : (
        <></>
      )}
    </>
  );
}

function blockStakeInAssetForGuest(myTokens: number, myInvestingSum: number, t: (key: string) => string) {
  return (
    <p className="mt-2 text-rentality-secondary 2xl:text-lg">
      {myTokens <= 0
        ? t("invest.no_stake_in_asset")
        : t("invest.stake_in_asset")
            .replace("{myTokens}", myTokens.toString())
            .replace("{myInvestingSum}", myInvestingSum.toString())}
    </p>
  );
}

function blockExpectCompletedTripsForGuest(t: (key: string) => string) {
  return (
    <p className="mx-auto mt-6 w-5/6 text-center text-[#FFFFFF70] 2xl:text-lg">{t("invest.expect_completed_trips")}</p>
  );
}

function btnClaimEarningsForGuest(
  myIncome: number,
  investmentId: number,
  handleClaimIncome: (investId: number) => Promise<void>,
  t: (key: string) => string
) {
  return (
    <RntButton
      className="mx-auto mt-6 flex h-14 w-full items-center justify-center"
      onClick={() => handleClaimIncome(investmentId)}
    >
      {t("invest.btn_claim_earnings")} ${myIncome.toFixed(2)}
    </RntButton>
  );
}

function blockInvestNowForGuest(
  investmentId: number,
  investmentAmount: number,
  handleInvest: (amount: number, investId: number) => void,
  isPendingInvesting: boolean,
  handleChangeInvestmentAmount: (e: React.ChangeEvent<HTMLInputElement>) => void,
  t: (key: string) => string
) {
  return (
    <>
      <div className="mt-6 flex">
        <div className="relative mr-2 inline-block w-2/5">
          <span className="pointer-events-none absolute left-2 top-[48%] -translate-y-1/2 text-white">$</span>
          <RntInputTransparent
            className="text-white"
            type="text"
            value={investmentAmount <= 0 ? "" : investmentAmount}
            onChange={handleChangeInvestmentAmount}
            placeholder="0"
          />
        </div>
        <RntButton
          className="mb-0.5 flex w-3/5 items-center justify-center"
          disabled={investmentAmount <= 0 || isPendingInvesting}
          onClick={() => handleInvest(investmentAmount, investmentId)}
        >
          {isPendingInvesting ? <>{t("invest.loading")}</> : <>{t("invest.btn_invest_now")}</>}
        </RntButton>
      </div>
      <p className="text-center text-[#FFFFFF70]">Enter USD equivalent, transaction in ETH</p>
    </>
  );
}

function getBlocksForHost(
  isCreator: boolean,
  investment: InvestmentInfo,
  handleStartHosting: (investId: number) => Promise<void>,
  t: (key: string) => string
) {
  const isReadyToClaim = (): boolean => {
    return isCreator && investment.payedInUsd >= investment.investment.priceInUsd && !investment.listed;
  };

  return isReadyToClaim() ? (
    <RntButton
      className="mx-auto mt-6 flex h-14 w-full items-center justify-center"
      onClick={() => handleStartHosting(investment.investmentId)}
    >
      {t("invest.btn_start_hosting")}
    </RntButton>
  ) : (
    <div className="mt-6 flex h-14 w-full"></div>
  );
}

function getBlockIncome(
  investment: InvestmentInfo,
  walletAddress: string,
  isHost: boolean,
  t: (key: string) => string
) {
  const receivedEarnings = (investment.income * investment.myPart) / 100;
  const head = isHost ? t("invest.host_management") : t("invest.your_expected_earnings");
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);

  return investStatus === InvestStatus.ActuallyListed ? (
    <>
      <p className="text-xl font-semibold text-rentality-secondary max-2xl:mb-4">{t("invest.earnings_history")}</p>
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        <p className="text-xl font-bold 2xl:text-2xl">${investment.income}</p>
        <p className="2xl:text-lg">{t("invest.total_earnings")}</p>
        <div className="mx-auto my-2 h-0.5 w-[40%] translate-y-[-50%] bg-white sm:w-[70%]"></div>
        <p className="text-xl font-bold leading-none text-rentality-secondary 2xl:text-2xl">${receivedEarnings}</p>
        <p className="text-center leading-snug 2xl:text-lg">{t("invest.your_received_earnings_part")}</p>
      </div>
    </>
  ) : (
    <>
      <span className="text-center text-lg text-rentality-secondary 2xl:text-xl fullHD:text-base">{head}</span>
      <span className="text-center text-lg 2xl:text-xl">
        {investment.myPart}% {t("invest.from_each_trip")}
      </span>
    </>
  );
}

function getCarListingStatus(
  investment: InvestmentInfo,
  walletAddress: string,
  isHost: boolean,
  t: (key: string) => string
) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);
  const formattedDate = moment(investment.listingDate).tz(UTC_TIME_ZONE_ID);
  const today = moment().tz(UTC_TIME_ZONE_ID);
  const daysDiff = today.diff(formattedDate, "days");
  return investStatus === InvestStatus.ActuallyListed
    ? t("invest.listed_days")
        .replace("{date}", dateFormatLongMonthYearDate(investment.listingDate))
        .replace("{days}", String(daysDiff))
    : investStatus === InvestStatus.ReadyListing
      ? t("invest.ready_listing")
      : investStatus === InvestStatus.ListingProgress
        ? t("invest.listing_coming_soon")
        : investStatus === InvestStatus.WaitingFullTokenization
          ? t("invest.waiting_full_tokenization")
          : t("invest.unknown");
}
