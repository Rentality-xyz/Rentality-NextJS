import { ContractSignedLocationInfo, EngineType } from "@/model/blockchain/schemas";
import { CarMetadata } from "@/utils/ipfsUtils";

export enum InvestStatus {
  Unknown,
  ActuallyListed,
  ReadyListing,
  ListingProgress,
  WaitingFullTokenization,
  Unlisted,
}

export type CreateCarRequest = {
  tokenUri: string;
  carVinNumber: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  pricePerDayInUsdCents: number;
  securityDepositPerTripInUsdCents: number;
  engineParams: number[];
  engineType: EngineType;
  milesIncludedPerDay: number;
  timeBufferBetweenTripsInSec: number;
  geoApiKey: string;
  locationInfo: ContractSignedLocationInfo;
  currentlyListed: boolean;
  insuranceRequired: boolean;
  insurancePriceInUsdCents: number;
  dimoTokenId: number;
};

export type CarInvestment = {
  car: CreateCarRequest;
  priceInCurrency: number;
  creatorPercents: number;
  inProgress: boolean;
};

export type InvestmentInfo = {
  investment: CarInvestment;
  nftUrl: string;
  investmentId: number;
  payedInUsd: number;
  creator: string;
  isCarBought: boolean;
  income: number;
  myIncome: number;
  myInvestingSum: number;
  listingDate: Date;
  myTokens: number;
  myPart: number;
  hostPart: number;
  totalHolders: number;
  totalTokens: number;
  listed: boolean;
  collectionName: string;
  collectionSymbol: string;
  totalEarnings: number;
  totalEarningsByUser: number;
  priceInUsdCents: number;
  payedInCurrency: number;
};

export type InvestmentInfoWithMetadata = {
  investment: InvestmentInfo;
  metadata: CarMetadata;
};
