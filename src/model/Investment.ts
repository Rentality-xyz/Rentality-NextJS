import {HostCarInfo} from "@/model/HostCarInfo";

export type CarInvestment = {
    car: HostCarInfo
    priceInUsd: BigInt,
    creatorPercents: BigInt
    inProgress: boolean
}
export type InvestmentInfo = {
    investment: CarInvestment,
    nft: string
}