import { getErc20ContractWithPaymentsAddress, getQuoterContract, getUniswapFactory } from "@/abis";
import { Err } from "@/model/utils/result";
import { ethers, Signer } from "ethers";
import { logger } from "./logger";
import { ETH_DEFAULT_ADDRESS } from "./constants";
import quote from './quote'


export default async function findBestPool(tokenIn: string, tokenOut: string, amountOut: bigint, signer: Signer) {
    const factoryResult = await getUniswapFactory(signer)

    if (factoryResult === null) {
        logger.error("Fail to get quoter")
        return;
      }
      let { factory } = factoryResult;
    

    const fees = [500, 3000, 10000];
    let bestQuote = null;

    for (let fee of fees) {
        try {
            const poolAddress = await factory.getPool(tokenIn, "0x4200000000000000000000000000000000000006", fee);
            if (poolAddress === ETH_DEFAULT_ADDRESS) continue;


            const pool = new ethers.Contract(poolAddress,
                [
                    "function liquidity() view returns (uint128)",
                    "function slot0() view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)"
                ],
                signer
            );

            const slot0 = await pool.slot0();
            let sqrtPriceX96 = slot0.sqrtPriceX96;
            const price = (Number(sqrtPriceX96) ** 2 / 2 ** 192);
            const liquidity = await pool.liquidity();
            console.log("liquidity:", liquidity);
            sqrtPriceX96 = sqrtPriceX96 * BigInt(105) / BigInt(100);

            let quoteResult = await quote(tokenIn, tokenOut, signer, amountOut, fee, sqrtPriceX96)
     
         

            if (!bestQuote || quoteResult.amountIn < bestQuote.amountIn) {
                bestQuote = {amountIn: quoteResult, fee}
            }

        } catch (e) {
            console.log("Error for fee", fee, e);
            continue;
        }
    }

        return bestQuote
}