import { ContractResultWrapper } from "../types";
import { ContractTransactionResponse, ethers } from "ethers";
import { Err, Ok } from "@/model/utils/result";
import { IEthersContract } from "./IEtherContract";
import { logger } from "@/utils/logger";

export function getEthersContractProxy<T extends IEthersContract>(contract: T): ContractResultWrapper<T> {
  return new Proxy(contract, {
    get(target, key, receiver) {
      const originalMethod = Reflect.get(target, key, receiver);

      if (typeof originalMethod !== "function") {
        return originalMethod;
      }
      logger.debug(`${key.toString()} proxy function called`);
      return async (...args: any[]) => {
        try {
          debugData(contract, key.toString(), args);

          const result = await originalMethod.apply(target, args);

          if (isContractTransactionResponse(result)) {
            logger.debug("proxy function return ContractTransactionResponse");
            await result.wait();
            return Ok(true);
          }
          return Ok(result);
        } catch (error) {
          logger.error(`${key.toString()} proxy function error:`, error);
          return Err(error);
        }
      };
    },
  }) as ContractResultWrapper<T>;
}

function isContractTransactionResponse(obj: any): obj is ContractTransactionResponse {
  return (
    obj &&
    typeof obj === "object" &&
    "provider" in obj &&
    "chainId" in obj &&
    "wait" in obj &&
    typeof obj.wait === "function"
  );
}
function debugData<T>(contract: T, fn: string, args: any[]) {
  const contractInterface = (contract as unknown as ethers.Contract).interface;
  const contractFn = contractInterface.getFunction(fn);
  const fnArgs = contractFn && contractFn.payable ? args.slice(0, args.length - 1) : args;

  const encodedData = contractInterface.encodeFunctionData(fn, fnArgs);
  logger.debug(`Encoded transaction data for ${fn.toString()}:`, encodedData);
}
