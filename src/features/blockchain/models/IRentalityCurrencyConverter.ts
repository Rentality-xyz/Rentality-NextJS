import { ContractResultWrapper } from "../types";
import { IEthersContract } from "./IEtherContract";

export interface IRentalityCurrencyConverter extends ContractResultWrapper<IRentalityCurrencyConverterContract> {}

export interface IRentalityCurrencyConverterContract extends IEthersContract {
  getFromUsdCentsLatest(currency: string, valueInUsdCents: bigint): Promise<[bigint]>;
}
