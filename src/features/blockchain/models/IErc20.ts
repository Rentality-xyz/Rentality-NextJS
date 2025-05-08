import { ContractTransactionResponse } from "ethers";
import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";

export interface IERC20 extends ContractResultWrapper<IERC20Contract> {}

export interface IERC20Contract extends IEthersContract {
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  totalSupply(): Promise<bigint>;
  balanceOf(account: string): Promise<bigint>;
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(spender: string, amount: bigint): Promise<ContractTransactionResponse>;
  transfer(recipient: string, amount: bigint): Promise<ContractTransactionResponse>;
  transferFrom(sender: string, recipient: string, amount: bigint): Promise<ContractTransactionResponse>;
}
