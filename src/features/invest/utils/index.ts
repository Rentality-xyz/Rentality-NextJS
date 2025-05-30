import moment from "moment";
import { InvestmentInfo, InvestStatus } from "../models/investmentInfo";
import { dateFormatLongMonthYearDate } from "@/utils/datetimeFormatters";
import { UTC_TIME_ZONE_ID } from "@/utils/constants";

export function getInvestmentStatus(investment: InvestmentInfo, t: (key: string) => string) {
  return investment.investment.priceInCurrency <= investment.payedInCurrency
    ? t("invest.fully_tokenized")
    : t("invest.available_invest");
}

export function getInvestListingStatus(investment: InvestmentInfo, walletAddress: string, isHost: boolean) {
  return !investment.listed
    ? InvestStatus.Unlisted
    : investment.listingDate !== undefined
      ? InvestStatus.ActuallyListed
      : (investment.investment.priceInCurrency <= investment.payedInCurrency || !investment.investment.inProgress) &&
          !investment.listed &&
          investment.creator === walletAddress &&
          isHost
        ? InvestStatus.ReadyListing
        : investment.investment.priceInCurrency <= investment.payedInCurrency &&
            !investment.listed &&
            investment.creator != walletAddress &&
            !isHost
          ? InvestStatus.ListingProgress
          : investment.investment.priceInCurrency > investment.payedInCurrency
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

  switch (investStatus) {
    case InvestStatus.ActuallyListed:
      return "bg-[#7355D7]";
    case InvestStatus.ReadyListing:
    case InvestStatus.ListingProgress:
      return "bg-[#A21CAF]";
    case InvestStatus.Unlisted:
      return "bg-[#EF4444]";
    default:
      return "bg-[#2563EB]";
  }
}

export function getCarListingStatus(
  investment: InvestmentInfo,
  walletAddress: string,
  isHost: boolean,
  t: (key: string) => string
) {
  const investStatus = getInvestListingStatus(investment, walletAddress, isHost);

  const message =
    investStatus === InvestStatus.ActuallyListed && investment.listingDate !== undefined
      ? t("invest.listed_days")
          .replace("{date}", dateFormatLongMonthYearDate(investment.listingDate))
          .replace("{days}", moment().diff(moment(investment.listingDate), "days").toString())
      : investStatus === InvestStatus.ReadyListing
        ? t("invest.ready_listing")
        : investStatus === InvestStatus.ListingProgress
          ? t("invest.listing_coming_soon")
          : investStatus === InvestStatus.WaitingFullTokenization
            ? t("invest.waiting_full_tokenization")
            : t("invest.unknown");

  return { investStatus, message };
}
