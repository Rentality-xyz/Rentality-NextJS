import { Result } from "@/model/utils/result";
import { ContractTransactionResponse } from "ethers";
import { Prettify } from "viem";

type GetPromiseType<T> = T extends Promise<infer U> ? U : T;

type WrapFunctionToResultType<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => Promise<Result<GetPromiseType<ReturnType<T>>, Error>>;

type ReplaceContractTransactionResponseToBoolean<T extends (...args: any) => any> = T extends (...args: any) => infer U
  ? U extends Promise<ContractTransactionResponse>
    ? (...args: Parameters<T>) => Promise<boolean>
    : T
  : T;

export type ContractResultWrapper<T> = {
  [K in keyof T]: T[K] extends (...args: any) => infer U
    ? WrapFunctionToResultType<ReplaceContractTransactionResponseToBoolean<T[K]>>
    : T[K];
};

///---------------------- TEST ---------------------------

interface BaseInterface {
  getString(): Promise<string>;
  getNumber(): Promise<number>;
  getBigInt(): Promise<bigint>;

  setString(value: string): Promise<boolean>;
  setNumber(value: number): Promise<boolean>;
  setBigInt(value: bigint): Promise<ContractTransactionResponse>;
}

interface TargetInterface {
  getString(): Promise<Result<string, Error>>;
  getNumber(): Promise<Result<number, Error>>;
  getBigInt(): Promise<Result<bigint, Error>>;

  setString(value: string): Promise<Result<boolean, Error>>;
  setNumber(value: number): Promise<Result<boolean, Error>>;
  setBigInt(value: bigint): Promise<Result<boolean, Error>>;
}

let resultString: Promise<Result<string, Error>>;
let resultNumber: Promise<Result<number, Error>>;
let resultBigInt: Promise<Result<bigint, Error>>;
let resultSetter: Promise<Result<boolean, Error>>;

let target: TargetInterface = {
  getString: function (): Promise<Result<string, Error>> {
    throw new Error("Function not implemented.");
  },
  getNumber: function (): Promise<Result<number, Error>> {
    throw new Error("Function not implemented.");
  },
  getBigInt: function (): Promise<Result<bigint, Error>> {
    throw new Error("Function not implemented.");
  },
  setString: function (value: string): Promise<Result<boolean, Error>> {
    throw new Error("Function not implemented.");
  },
  setNumber: function (value: number): Promise<Result<boolean, Error>> {
    throw new Error("Function not implemented.");
  },
  setBigInt: function (value: bigint): Promise<Result<boolean, Error>> {
    throw new Error("Function not implemented.");
  },
};

resultString = target.getString();
resultNumber = target.getNumber();
resultBigInt = target.getBigInt();

resultSetter = target.setString("");
resultSetter = target.setNumber(0);
resultSetter = target.setBigInt(BigInt(0));

let converter: Prettify<ContractResultWrapper<BaseInterface>> = {
  getString: function (): Promise<Result<string, Error>> {
    throw new Error("Function not implemented.");
  },
  getNumber: function (): Promise<Result<number, Error>> {
    throw new Error("Function not implemented.");
  },
  getBigInt: function (): Promise<Result<bigint, Error>> {
    throw new Error("Function not implemented.");
  },
  setString: function (value: string): Promise<Result<boolean, Error>> {
    throw new Error("Function not implemented.");
  },
  setNumber: function (value: number): Promise<Result<boolean, Error>> {
    throw new Error("Function not implemented.");
  },
  setBigInt: function (value: bigint): Promise<Result<boolean, Error>> {
    throw new Error("Function not implemented.");
  },
};

resultString = converter.getString();
resultNumber = converter.getNumber();
resultBigInt = converter.getBigInt();

resultSetter = converter.setString("");
resultSetter = converter.setNumber(0);
resultSetter = converter.setBigInt(BigInt(0));
