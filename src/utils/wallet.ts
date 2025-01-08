import { formatEther } from "viem";
import { MIN_ETH_ON_WALLET_FOR_TRANSACTION } from "./constants";
import { Signer } from "ethers";

export async function isUserHasEnoughFunds(signer: Signer, valueToCheck: number = MIN_ETH_ON_WALLET_FOR_TRANSACTION) {
  const userAddress = await signer.getAddress();
  const userBalanceWeth = await signer.provider?.getBalance(userAddress);

  if (userBalanceWeth == undefined) {
    console.error("checkWalletBalance error: getBalance return undefined");
    return false;
  }

  const userBalanceEth = Number(formatEther(userBalanceWeth));
  console.debug(`userAddress: ${userAddress} has balance ${userBalanceWeth} WETH or ${userBalanceEth} ETH`);

  return userBalanceEth >= valueToCheck;
}
