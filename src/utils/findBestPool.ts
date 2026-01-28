import { getErc20ContractWithPaymentsAddress, getQuoterContract, getUniswapFactory } from "@/abis";
import { Err } from "@/model/utils/result";
import { ethers, Signer } from "ethers";
import { logger } from "./logger";
import { ETH_DEFAULT_ADDRESS, WETH_ADDRESS } from "./constants";
import quote from './quote'
import getDefaultProvider from "./api/defaultProviderUrl";


export default async function findBestPool(tokenIn: string, tokenOut: string, amountOut: bigint, signer: Signer) {
    let payWith = tokenIn === ETH_DEFAULT_ADDRESS ? WETH_ADDRESS : tokenIn;
    const defaultProvider = await getDefaultProvider();
    const chainId = await defaultProvider.getNetwork().then(net => BigInt(net.chainId));
    const factoryResult = await getUniswapFactory(defaultProvider)

    if (factoryResult === null) {
        logger.error("Fail to get quoter")
        return;
      }
      let { factory } = factoryResult;
    
    const fees = [100, 500, 3000, 10000];
    let bestQuote = null;
 
    for (let fee of fees) {
        try {
            const poolAddress = await factory.getPool(payWith, tokenOut, fee);
            if (poolAddress === ETH_DEFAULT_ADDRESS) continue;

        

            const pool = new ethers.Contract(poolAddress,
                [
                    "function liquidity() view returns (uint128)",
                    "function slot0() view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)"
                ],
                defaultProvider
            );

            const slot0 = await pool.slot0();
            let sqrtPriceX96 = slot0.sqrtPriceX96;
            sqrtPriceX96 = sqrtPriceX96 * BigInt(105) / BigInt(100);

            let liquidity = await pool.liquidity();
            let network = await signer.provider?.getNetwork()
            if (network) {
            let isTestnet = chainId === BigInt(5611) || chainId === BigInt(84532)
            sqrtPriceX96 = isTestnet ? 0 : sqrtPriceX96
            }
            let quoteResult = await quote(payWith, tokenOut, defaultProvider, amountOut, fee, sqrtPriceX96)
     
        
            if (!bestQuote || (quoteResult.amountIn < bestQuote.amountIn && bestQuote.liquidity < liquidity) ) {
                bestQuote = {amountIn: quoteResult, fee, liquidity}
            }

        } catch (e) {
            console.log("Error for fee", fee, e);
            continue;
        }
    }

        return bestQuote
}