import { ContractTransactionResponse } from "ethers";
import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";
import { CaseType, ContractMotionCloudCaseDTO } from "@/model/blockchain/schemas";

export interface IRentalityMotionsCloud extends ContractResultWrapper<IRentalityMotionsCloudContract> {}

export interface IRentalityMotionsCloudContract extends IEthersContract {
  getReportUrl(caseToken: string): Promise<string>;
  isCaseTokenExists(caseToken: string): Promise<boolean>;
  getCasesByTripId(tripId: bigint): Promise<ContractMotionCloudCaseDTO[]>;
  getCaseTokenForTrip(tripId: bigint, caseType: CaseType): Promise<string>;
  saveInsuranceCaseUrl(caseToken: string, url: string): Promise<ContractTransactionResponse>;
  saveInsuranceCase(caseToken: string, tripId: bigint, caseType: CaseType): Promise<ContractTransactionResponse>;
}
