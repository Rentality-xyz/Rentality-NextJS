import { ContractTransactionResponse } from "ethers";
import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";

export interface IQuoterV2 extends ContractResultWrapper<IQuoterV2Contract> {}

export interface IQuoterV2Contract extends IEthersContract {
  quoteExactInputSingle(
    params: {
      tokenIn: string;
      tokenOut: string;
      fee: number;
      amountIn: bigint;
      sqrtPriceLimitX96: bigint;
    }
  ): Promise<{
    amountOut: bigint;
    sqrtPriceX96After: bigint;
    initializedTicksCrossed: number;
    gasEstimate: bigint;
  }>;

  quoteExactInput(
    params: {
      path: string; // bytes encoded path
      amountIn: bigint;
    }
  ): Promise<{
    amountOut: bigint;
    sqrtPriceX96AfterList: bigint[];
    initializedTicksCrossedList: number[];
    gasEstimate: bigint;
  }>;

  quoteExactOutputSingle(
    params: {
      tokenIn: string;
      tokenOut: string;
      fee: number;
      amountOut: bigint;
      sqrtPriceLimitX96: bigint;
    }
  ): Promise<{
    amountIn: bigint;
    sqrtPriceX96After: bigint;
    initializedTicksCrossed: number;
    gasEstimate: bigint;
  }>;

  quoteExactOutput(
    params: {
      path: string; // bytes encoded path
      amountOut: bigint;
    }
  ): Promise<{
    amountIn: bigint;
    sqrtPriceX96AfterList: bigint[];
    initializedTicksCrossedList: number[];
    gasEstimate: bigint;
  }>;

  callStatic: {
    quoteExactInputSingle: IQuoterV2Contract["quoteExactInputSingle"];
    quoteExactInput: IQuoterV2Contract["quoteExactInput"];
    quoteExactOutputSingle: IQuoterV2Contract["quoteExactOutputSingle"];
    quoteExactOutput: IQuoterV2Contract["quoteExactOutput"];
  };
}
