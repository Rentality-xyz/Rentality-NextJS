import { ContractResultWrapper } from "../types";
import { ContractTransactionResponse, ethers } from "ethers";
import { Err, Ok } from "@/model/utils/result";
import { IEthersContract } from "./IEtherContract";
import { logger } from "@/utils/logger";
import { fn } from "moment";

export function getEthersContractProxy<T extends IEthersContract, S extends IEthersContract>(
  writeContract: T, 
  readContract: S,
  senderAddress: string,
  isDefaultNetwork: boolean
): ContractResultWrapper<T> {
  return new Proxy(writeContract, {
    get(target, key, receiver) {
    
  
      return async (...args: any[]) => {
        try {
          const contractInterface = (readContract as unknown as ethers.Contract).interface;
          const functionFragment = contractInterface.getFunction(key.toString());
          
          const isReadFunction = functionFragment && 
            (functionFragment.stateMutability === "view" || 
             functionFragment.stateMutability === "pure");

          const contractToUse = isReadFunction ? readContract : writeContract;

          debugData(contractToUse, key.toString(), args);
          let result;
          if (!isReadFunction && !isDefaultNetwork) {
            const fnName = key.toString();
            const capitalizedFnName = fnName.charAt(0).toUpperCase() + fnName.slice(1);
            const quote = "quote" + capitalizedFnName;

            const quoteMethod = Reflect.get(target, quote, receiver);

            const originalMethod = Reflect.get(writeContract, key, receiver);

            if (typeof originalMethod !== "function") {
              return originalMethod;
            }
            
            if (typeof quoteMethod !== "function") {
              throw new Error(`Quote function '${quote}' is not a function. Type: ${typeof quoteMethod}`);
            }
            let quoteResult

            if(functionFragment && functionFragment.payable && args[args.length - 1].value) {
              quoteResult = await quoteMethod.apply(contractToUse,[
                args[args.length - 1].value,
                ...args.slice(0, args.length - 1)
              ]);
            }
            else {
              quoteResult = await await quoteMethod.apply(writeContract, args);

              console.log("QUOTE RESULT ", quoteResult)
              args = [...args, {value: quoteResult}];
            }
            result = await originalMethod.apply(writeContract, args);

          }
          else {
            const originalMethod = Reflect.get(readContract, key, receiver);

            if (typeof originalMethod !== "function") {
              return originalMethod;
            }
            if(isReadFunction) {
              result = await (contractToUse as any)[key.toString()].staticCall(...args, {
                from: senderAddress
              });
             }
             else 
          result = await originalMethod.apply(contractToUse, args);
          }

          if (isContractTransactionResponse(result)) {
            await result.wait(4); // block confirmation
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