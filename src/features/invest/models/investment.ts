import { HostCarInfo } from "@/model/HostCarInfo";

export type CarInvestmentold = {
  car: HostCarInfo;
  priceInUsd: BigInt;
  creatorPercents: BigInt;
  inProgress: boolean;
};

export type InvestmentInfoold = {
  investment: CarInvestmentold;
  nft: string;
};
