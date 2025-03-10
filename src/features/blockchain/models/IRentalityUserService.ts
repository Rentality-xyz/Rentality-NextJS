import { IEthersContract } from "./IEtherContract";
import { ContractResultWrapper } from "../types";

export interface IRentalityUserService extends ContractResultWrapper<IRentalityUserServiceContract> {}

export interface IRentalityUserServiceContract extends IEthersContract {
  isHost(user: string): Promise<boolean>;
  isInvestorManager(user: string): Promise<boolean>;
}
