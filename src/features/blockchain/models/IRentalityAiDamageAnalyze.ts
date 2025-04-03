import { ContractTransactionResponse } from "ethers";
import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";
import { ContractInsuranceCaseDTO } from "@/model/blockchain/schemas";

export interface IRentalityAiDamageAnalyze extends ContractResultWrapper<IRentalityAiDamageAnalyzeContract> {}

export interface IRentalityAiDamageAnalyzeContract extends IEthersContract {
  saveInsuranceCase(iCase: string, tripId: bigint, pre: boolean): Promise<ContractTransactionResponse>;
  saveInsuranceCaseUrl(iCase: string, url: string): Promise<ContractTransactionResponse>;
  getInsuranceCasesUrlByTrip(tripId: bigint): Promise<ContractInsuranceCaseDTO[]>;
  isCaseExists(iCase: string): Promise<string>;
  getInsuranceCaseByTrip(tripId: bigint, pre: boolean): Promise<string>;
}
