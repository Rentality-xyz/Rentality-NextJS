import { ContractTransactionResponse } from "ethers";
import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";

export interface IRentalityAiDamageAnalyze extends ContractResultWrapper<IRentalityAiDamageAnalyzeContract> {}

export interface IRentalityAiDamageAnalyzeContract extends IEthersContract {
  saveInsuranceCase(iCase: string, tripId: bigint): Promise<ContractTransactionResponse>;
  saveInsuranceCaseUrl(iCase: string, url: string): Promise<ContractTransactionResponse>;
  getInsuranceCaseUrlByTrip(tripId: bigint): Promise<string>;
  isCaseExists(iCase: string): Promise<string>;
}
