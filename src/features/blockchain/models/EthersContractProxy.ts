import { ContractResultWrapper } from "../types";
import { ContractTransactionResponse, ethers, JsonRpcProvider } from "ethers";
import { Err, Ok } from "@/model/utils/result";
import { IEthersContract } from "./IEtherContract";
import { logger } from "@/utils/logger";

export function getEtherscrossChainProxy<T extends IEthersContract, S extends IEthersContract>(
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
          /// avoid proxying special properties
          if (typeof key === 'symbol' || key === 'toJSON' || key === 'toString') {
            return Reflect.get(target, key, receiver);
          }
          const contractInterface = (readContract as unknown as ethers.Contract).interface;
          
          const functionFragment = contractInterface.getFunction(key.toString());
          
          const isReadFunction = functionFragment && 
            (functionFragment.stateMutability === "view" || 
             functionFragment.stateMutability === "pure");
          const contractToUse = isReadFunction ? readContract : writeContract;

          let result;
          /// crosschain call simulation and quote
          if (!isReadFunction && !isDefaultNetwork) {
            /// getValue from args if payable
            const value = ( functionFragment && functionFragment.payable && args[args.length - 1].value)? args[args.length - 1].value : 0;
            const argForSimulation = value > 0 ? args.slice(0, args.length - 1): args;
            const readAsContract = (readContract as unknown as ethers.Contract)

            const argmuments = readAsContract.interface.encodeFunctionData(key.toString(), argForSimulation)
            const contractAddress =  await readAsContract.getAddress()

          let gasLimit = await provider.send("eth_estimateGas", [
            {
              from: senderAddress,
              to: contractAddress,
              data: argmuments,
              value: Number(value),
            },
            "latest",
            {
              [senderAddress]: {
                balance: "0x3635C9ADC5DEA00000" // 1000 ETH
              }
            }
          ]);
            gasLimit = Math.floor(gasLimit * 120 / 100); // add 20% buffer

            // do quote on sender contract
            const quote = "quote";
            let quoteMethod = Reflect.get(target, quote, receiver);
          
            if (typeof quoteMethod !== "function") {
              throw new Error(`Quote function '${quote}' is not a function. Type: ${typeof quoteMethod}`);
            }
          
            let quoteResult = await quoteMethod.apply(contractToUse,[
                value,
                gasLimit,
                argmuments
              ]);

              const fnSignature = `send(uint256, uint256 ,bytes)`;
              let originalMethod = Reflect.get(writeContract, fnSignature, receiver);

              if (typeof originalMethod !== "function") {
                return originalMethod;
              }
        
            try {
              // simulate transction on target chain
              await provider.send("eth_call", [
              {
                to: contractAddress,
                from: senderAddress,
                value: Number(value),
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
          /// execute crosschain transaction
            result = await originalMethod.apply(writeContract, [
              value,
              gasLimit,
              argmuments,
              {value: quoteResult},
            ]);
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