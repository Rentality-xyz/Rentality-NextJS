import {
  ContractAllRefferalInfoDTO,
  ContractMyRefferalInfoDTO,
  ContractProgramHistory,
  ContractReadyToClaimDTO,
  ContractRefferalHashDTO,
} from "@/model/blockchain/schemas";
import { ContractTransactionResponse } from "ethers";
import { IEthersContract } from "./IEtherContract";

export interface IRentalityReferralProgramContract extends IEthersContract {
  // user points
  addressToPoints(address: string): Promise<number>;
  // user ref hash
  referralHash(user: string): Promise<string>;
  // when last time daily was claimed
  getCarDailyClaimedTime(carId: number): Promise<number>;
  // claim user points
  claimPoints(user: string): Promise<ContractTransactionResponse>;
  // get info about not claimed points
  // info about not claimed points, from ref hash
  getReadyToClaimFromRefferalHash(user: string): Promise<ContractRefferalHashDTO>;
  // claim points from user ref hash
  claimRefferalPoints(user: string): Promise<ContractTransactionResponse>;
  // get full information about point, tears, e.t.c
  getRefferalPointsInfo(): Promise<ContractAllRefferalInfoDTO>;
  // get points reduces and increases
  getPointsHistory(): Promise<ContractProgramHistory[]>;

  getReadyToClaim(user: string): Promise<ContractReadyToClaimDTO>;
  getMyRefferalInfo(): Promise<ContractMyRefferalInfoDTO>;
}
