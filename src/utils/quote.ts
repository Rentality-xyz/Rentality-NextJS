import { getQuoterContract } from "@/abis";
import { Err } from "@/model/utils/result";
import { Signer } from "ethers";
import { logger } from "./logger";

export default async function quote(tokenIn: string, tokenOut: string, signer: Signer, amount: bigint, fee: number, sqrtPrice: bigint) {
  const result = await getQuoterContract(signer);
  if (result === null) {
    logger.error("Fail to get quoter")
    return;
  }
  let { quoter } = result;


const quote = await quoter.quoteExactOutputSingle.staticCall({
    tokenIn,
    tokenOut: tokenOut,
    fee: fee,
    amount,
    sqrtPriceLimitX96: sqrtPrice
  });

  return quote.amountIn
}
