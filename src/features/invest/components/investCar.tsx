import RntButton from "../../../components/common/rntButton";
import React, { useState } from "react";
import { InvestmentDTO, InvestmentWithMetadata } from "@/model/blockchain/schemas";
import { useTranslation } from "react-i18next";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { cn } from "@/utils";

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
  isCreator,
  handleStartHosting,
  handleClaimIncome,
}: {
  isHost: boolean;
  searchInfo: InvestmentWithMetadata;
  handleInvest: (amount: number, investId: number) => void;
  isCreator: boolean;
  handleStartHosting: (investId: number) => Promise<void>;
  handleClaimIncome: (investId: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const test = isHost ? t("invest.host_management") : t("invest.your_expected_earnings");
  const ethereumInfo = useEthereum();
  const [investmentAmount, setInvestmentAmount] = useState(0);

  const handleChangeInvestmentAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputInvestmentAmount = e.target.value.replace(/\D/g, "0"); // Удаляем всё, кроме цифр
    setInvestmentAmount(Number.parseInt(inputInvestmentAmount));
  };

  let income = Number.parseInt(searchInfo.investment.income.toString());
  income = income > 0 ? income / 100 : income;

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 fullHD:grid-cols-2">
      <div className="flex w-full flex-col rounded-xl bg-rentality-bg-left-sidebar">
        <div
          className={cn(
            "w-full rounded-t-xl py-1 pl-4",
            getColorInvestmentStatus(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost, t)
          )}
        >
          <div className="flex max-2xl:flex-col">
            <span>{getInvestmentStatus(searchInfo.investment, t)}</span>
            <span className="mx-2 max-2xl:hidden">|</span>
            <span>
              {getTxtInvestmentListingStatus(searchInfo.investment, ethereumInfo?.walletAddress ?? "", isHost, t)}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col">
          <div
            style={{ backgroundImage: `url(${searchInfo.metadata.image})` }}
            className="h-[180px] bg-cover bg-center bg-no-repeat p-2 2xl:h-[480px] fullHD:h-[340px]"
          ></div>
          <div className="flex w-full grid-cols-[1.5fr_1fr_1fr] flex-col gap-2 2xl:grid">
            <div className="relative p-2">
              <p className="text-xl font-bold">
                {`${searchInfo.investment.investment.car.brand} ${searchInfo.investment.investment.car.model} ${searchInfo.investment.investment.car.yearOfProduction}`}
              </p>
              <p className="font-medium text-[#FFFFFF70]">
                {`${searchInfo.investment.investment.car.locationInfo.locationInfo.city}, ${searchInfo.investment.investment.car.locationInfo.locationInfo.state}, ${searchInfo.investment.investment.car.locationInfo.locationInfo.country}`}
              </p>
              {isHost
                ? getBlocksForHost(isCreator, searchInfo.investment, handleStartHosting, t)
                : getBlocksForGuest(
                    searchInfo.investment,
                    investmentAmount,
                    handleChangeInvestmentAmount,
                    handleClaimIncome,
                    t
                  )}
              <p className="mt-8">Listing status:</p>
              <p className="text-rentality-secondary">Waiting for full tokenization</p>
              <div className={ccsDividerVert}></div>
              <div className={ccsDividerHor}></div>
            </div>
            <div className="relative flex h-full flex-col p-2 text-center max-2xl:py-4">
              <p className="text-xl font-semibold max-2xl:mb-4">{t("invest.tokenization")}</p>
              <div className="flex flex-grow flex-col justify-center">
                <p className="text-xl font-bold 2xl:text-2xl">${String(searchInfo.investment.investment.priceInUsd)}</p>
                <p className="2xl:text-lg">Total price</p>
                <div className="mx-auto my-2 h-0.5 w-[60%] translate-y-[-50%] bg-white"></div>
                <p className="text-xl font-bold leading-none text-rentality-secondary 2xl:text-2xl">
                  $
                  {String(
                    Number(searchInfo.investment.investment.priceInUsd) - Number(searchInfo.investment.payedInUsd)
                  )}
                </p>
                <p className="leading-snug text-rentality-secondary 2xl:text-lg">Balance to be raised</p>
              </div>
              <div className={ccsDividerVert}></div>
              <div className={ccsDividerHor}></div>
            </div>
            <div className="flex flex-col items-center justify-center p-2 max-2xl:py-4">
              <span className="text-lg text-rentality-secondary 2xl:text-xl fullHD:text-base">{test}</span>
              <span className="text-lg 2xl:text-xl">40% {t("invest.from_each_trip")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInvestmentStatus(investment: InvestmentDTO, t: (key: string) => string) {
  return Number(investment.investment.priceInUsd) <= Number(investment.payedInUsd)
    ? t("invest.fully_tokenized")
    : t("invest.available_invest");
}

function getInvestListingStatus(investment: InvestmentDTO, walletAddress: string, isHost: boolean) {
  return Number(investment.listingDate) > 0
    ? InvestStatus.ActuallyListed
    : Number(investment.investment.priceInUsd) <= Number(investment.payedInUsd) &&
        Number(investment.listingDate) <= 0 &&
        investment.creator === walletAddress &&
        isHost
      ? InvestStatus.ReadyListing
      : Number(investment.investment.priceInUsd) <= Number(investment.payedInUsd) &&
          Number(investment.listingDate) <= 0 &&
          investment.creator != walletAddress &&
          !isHost
        ? InvestStatus.ListingProgress
        : Number(investment.investment.priceInUsd) > Number(investment.payedInUsd)
          ? InvestStatus.WaitingFullTokenization
          : InvestStatus.Unknown;
}

function getTxtInvestmentListingStatus(
  investment: InvestmentDTO,
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

function getColorInvestmentStatus(
  investment: InvestmentDTO,
  walletAddress: string,
  isHost: boolean,
  t: (key: string) => string
) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);
  return investStatus === InvestStatus.ActuallyListed
    ? "bg-[#7355D7]"
    : investStatus === InvestStatus.ReadyListing || investStatus === InvestStatus.ListingProgress
      ? "bg-[#A21CAF]"
      : "bg-[#2563EB]";
}

function getBlocksForGuest(
  investment: InvestmentDTO,
  investmentAmount: number,
  handleChangeInvestmentAmount: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleClaimIncome: (investId: number) => Promise<void>,
  t: (key: string) => string
) {
  const myIncome = Number(investment.myIncome) > 0 ? Number(investment.myIncome) / 100 : Number(investment.myIncome);
  return (
    <>
      {blockStakeInAssetForGuest(Number(investment.myTokens), Number(investment.myInvestingSum), t)}
      {Number(investment.myTokens) > 0 && myIncome === 0 && Number(investment.listingDate) !== 0
        ? blockExpectCompletedTripsForGuest(t)
        : Number(investment.myTokens) > 0
          ? btnClaimEarningsForGuest(myIncome, Number(investment.investmentId), handleClaimIncome, t)
          : blockInvestNowForGuest(investmentAmount, handleChangeInvestmentAmount, t)}
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
      <div className="flex w-full items-center justify-center text-white">
        <span className="ml-4 w-full">
          {t("invest.btn_claim_earnings")} ${myIncome}
        </span>
        <span className="ml-auto mr-4">●</span>
      </div>
    </RntButton>
  );
}

function blockInvestNowForGuest(
  investmentAmount: number,
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
        <RntButton className="mb-0.5 flex w-3/5 items-center justify-center">
          <div className="ml-0.5 flex items-center">
            {t("invest.btn_invest_now")}
            <span className="ml-4">●</span>
          </div>
        </RntButton>
      </div>
      <p className="text-center text-[#FFFFFF70]">Enter USD equivalent, transaction in ETH</p>
    </>
  );
}

function getBlocksForHost(
  isCreator: boolean,
  investment: InvestmentDTO,
  handleStartHosting: (investId: number) => Promise<void>,
  t: (key: string) => string
) {
  const priceDiff =
    (Number.parseInt(investment.investment.priceInUsd.toString()) - Number.parseInt(investment.payedInUsd.toString())) /
    100;

  const isReadyToClaim = (): boolean => {
    return priceDiff <= 0;
  };

  return isCreator && isReadyToClaim() ? (
    <RntButton
      className="mx-auto mt-6 flex h-14 w-full items-center justify-center"
      onClick={() => handleStartHosting(Number(investment.investmentId))}
    >
      <div className="flex w-full items-center justify-center text-white">
        <span className="ml-4 w-full">{t("invest.btn_start_hosting")}</span>
        <span className="ml-auto mr-4">●</span>
      </div>
    </RntButton>
  ) : (
    <div className="mt-6 flex h-14 w-full"></div>
  );
}
