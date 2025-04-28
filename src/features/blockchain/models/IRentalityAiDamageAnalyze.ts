import { ContractTransactionResponse } from "ethers";
import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";
import { CaseType, ContractAiDamageAnalyzeCaseDTO } from "@/model/blockchain/schemas";

export interface IRentalityAiDamageAnalyze extends ContractResultWrapper<IRentalityAiDamageAnalyzeContract> {}

export interface IRentalityAiDamageAnalyzeContract extends IEthersContract {
  getReportUrl(caseToken: string): Promise<string>;
  isCaseTokenExists(caseToken: string): Promise<boolean>;
  getCasesByTripId(tripId: bigint): Promise<ContractAiDamageAnalyzeCaseDTO[]>;
  getCaseTokenForTrip(tripId: bigint, caseType: CaseType): Promise<string>;
  saveInsuranceCaseUrl(caseToken: string, url: string): Promise<ContractTransactionResponse>;
  saveInsuranceCase(caseToken: string, tripId: bigint, caseType: CaseType): Promise<ContractTransactionResponse>;
}
