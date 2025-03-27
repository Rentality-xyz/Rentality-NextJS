import moment from "moment";
import { InvestmentInfo, InvestStatus } from "../models/investmentInfo";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { dateFormatLongMonthYearDate } from "@/utils/datetimeFormatters";

export function getInvestmentStatus(investment: InvestmentInfo, t: (key: string) => string) {
  return investment.investment.priceInUsd <= investment.payedInUsd
    ? t("invest.fully_tokenized")
    : t("invest.available_invest");
}

export function getInvestListingStatus(investment: InvestmentInfo, walletAddress: string, isHost: boolean) {
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

export function getTxtInvestmentListingStatus(
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

export function getColorInvestmentStatus(investment: InvestmentInfo, walletAddress: string, isHost: boolean) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);
  return investStatus === InvestStatus.ActuallyListed
    ? "bg-[#7355D7]"
    : investStatus === InvestStatus.ReadyListing || investStatus === InvestStatus.ListingProgress
      ? "bg-[#A21CAF]"
      : "bg-[#2563EB]";
}

export function getCarListingStatus(
  investment: InvestmentInfo,
  walletAddress: string,
  isHost: boolean,
  t: (key: string) => string
) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);
  const formattedDate = moment(investment.listingDate).tz(UTC_TIME_ZONE_ID);
  const today = moment().tz(UTC_TIME_ZONE_ID);
  const daysDiff = today.diff(formattedDate, "days");

  const message =
    investStatus === InvestStatus.ActuallyListed
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

  return { investStatus, message };
}
