import { getErc20ContractWithPaymentsAddress } from "@/abis";
import { formatEther, Signer } from "ethers";
import { ETH_DEFAULT_ADDRESS } from "./constants";

export async function formatCurrencyWithSigner(address: string, signer: Signer, amount: bigint) {
  if (address === ETH_DEFAULT_ADDRESS) {
    return Number(formatEther(amount));
  }
  return amount;
}
