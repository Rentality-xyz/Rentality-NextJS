import { ContractResultWrapper } from "../types";
import { ContractTransactionResponse, ethers, JsonRpcProvider } from "ethers";
import { Err, Ok } from "@/model/utils/result";
import { IEthersContract } from "./IEtherContract";
import { logger } from "@/utils/logger";
import { fn } from "moment";

export function getEthersCrassChainProxy<T extends IEthersContract, S extends IEthersContract>(
  writeContract: T, 
  readContract: S,
  senderAddress: string,
  isDefaultNetwork: boolean,
  provider: JsonRpcProvider
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

          let result;
          if (!isReadFunction && !isDefaultNetwork) {
            // do quote in case of crasschain call
            let argForSimulation = args;
            let valueForSimulation = 0;
            const fnName = key.toString();
            const capitalizedFnName = fnName.charAt(0).toUpperCase() + fnName.slice(1);
            const quote = "quote" + capitalizedFnName;
            let quoteMethod = Reflect.get(target, quote, receiver);
            let originalMethod = Reflect.get(writeContract, key, receiver);

            if (typeof originalMethod !== "function") {
              return originalMethod;
            }
      
            
            if (typeof quoteMethod !== "function") {
              throw new Error(`Quote function '${quote}' is not a function. Type: ${typeof quoteMethod}`);
            }
            let quoteResult;
            if(functionFragment && functionFragment.payable && args[args.length - 1].value) {
              // if function is payeble, we need to specify value for quote,
              //  and encode the arguments for target chain
              const value = args[args.length - 1].value;
              valueForSimulation = value;
              quoteResult = await quoteMethod.apply(contractToUse,[
                args[args.length - 1].value,
                ...args.slice(0, args.length - 1)
              ]);
              argForSimulation = argForSimulation.slice(0, -1);
              args = [(readContract as unknown as ethers.Contract).interface.encodeFunctionData(fnName, args.slice(0, args.length - 1))];
              args = [value,...args,{value: quoteResult}];
              const fnSignature = `${originalMethod.name}(uint256,bytes)`;
              originalMethod = Reflect.get(writeContract, fnSignature, receiver);

              if (typeof originalMethod !== "function") {
                return originalMethod;
              }
            }
            else {
              quoteResult = await await quoteMethod.apply(writeContract, args);

              args = [...args, {value: quoteResult}];
            }

            const readAsContract = (readContract as unknown as ethers.Contract)
            const contractAddress =  await readAsContract.getAddress()

            const argmuments = readAsContract.interface.encodeFunctionData(key.toString(), argForSimulation)
            try {
              // simulate transction on target chain
              await provider.send("eth_call", [
              {
                to: contractAddress,
                from: senderAddress,
                value: valueForSimulation.toString(),
                data: argmuments,
              },
              "latest",
              {
                [senderAddress]: {
                balance: ethers.parseEther("2").toString()
              },
              },
            ]);
          }
          catch (error) {
            logger.error(`${key.toString()} proxy function error:`, error);
            
            return Err(error);
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
             else {
              debugData(writeContract, key.toString(), args);
              result = await originalMethod.apply(contractToUse, args);
        }
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
            await result.wait(4); //block confirmation
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