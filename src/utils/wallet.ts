import { formatEther } from "viem";
import { ETH_DEFAULT_ADDRESS, MIN_ETH_ON_WALLET_FOR_TRANSACTION } from "./constants";
import { Signer, zeroPadBytes } from "ethers";
import { logger } from "./logger";
import { getErc20ContractWithPaymentsAddress } from "@/abis";

export async function isUserHasEnoughFunds(
  signer: Signer,
  valueToCheck: number | bigint = MIN_ETH_ON_WALLET_FOR_TRANSACTION,
  currency = { currency: ETH_DEFAULT_ADDRESS, name: "ETH" }
) {
  const userAddress = await signer.getAddress();
  let userBalance;
  let valueToCheckInCurrency
  if (currency.currency === ETH_DEFAULT_ADDRESS) {
    userBalance = await signer.provider?.getBalance(userAddress);
    if (userBalance == undefined) {
      logger.error("checkWalletBalance error: getBalance return undefined");
      return false;
    }
  } else {
    const erc20ContractResult = await getErc20ContractWithPaymentsAddress(currency.currency, signer);
    if (!erc20ContractResult) {
      throw Error("Erc20 contract not found");
    }
    const { erc20 } = erc20ContractResult;
    userBalance = await erc20.balanceOf(userAddress);

  }
  console.log("USER BALANCE: ", userBalance)
  console.log("valueToCheck: ", valueToCheck)

  return userBalance >= valueToCheck;
}

export const ZERO_4_BYTES_HASH = zeroPadBytes("0x00", 4);
export const ZERO_HASH = zeroPadBytes("0x", 4);
