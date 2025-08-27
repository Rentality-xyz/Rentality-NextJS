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

      return async (...args: any[]) => {
        try {
          debugData(contract, key.toString(), args);

          const result = await originalMethod.apply(target, args);

          if (isContractTransactionResponse(result)) {
            await result.wait(2); //block confirmation
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

function debugData<T>(contract: T, fnName: string, args: any[]) {
  const contractInterface = (contract as unknown as ethers.Contract).interface;
  const contractFn = contractInterface.getFunction(fnName);
  const fnArgs = contractFn && contractFn.payable ? args.slice(0, args.length - 1) : args;

  const encodedData = contractInterface.encodeFunctionData(fnName, fnArgs);
  logger.debug(`${fnName} proxy function called with encoded transaction data:`, encodedData);
}
