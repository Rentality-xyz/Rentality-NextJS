import { ContractCreateCarRequest, ContractInvestmentDTO } from "@/model/blockchain/schemas";
import { ContractTransactionResponse } from "ethers";
import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";

export interface IRentalityInvestment extends ContractResultWrapper<IRentalityInvestmentContract> {}

export interface IRentalityInvestmentContract extends IEthersContract {
  address: string;

  claimAndCreatePool(investId: number, createCarRequest: ContractCreateCarRequest): Promise<ContractTransactionResponse>;

  getAllInvestments(): Promise<ContractInvestmentDTO[]>;

  invest(investId: number, amount: bigint, value: object): Promise<ContractTransactionResponse>;

  claimAllMy(investId: number): Promise<ContractTransactionResponse>;

  createCarInvestment(
    car: {
      inProgress: boolean;
      car: ContractCreateCarRequest;
      priceInUsd: bigint;
      creatorPercents: bigint;
    },
    name_: string,
    currency: string
  ): Promise<ContractTransactionResponse>;
}
