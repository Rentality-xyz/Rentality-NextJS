import { getErc20ContractWithPaymentsAddress } from "@/abis";
import { Err } from "@/model/utils/result";
import { Signer } from "ethers";

export default async function approve(currency: string, signer: Signer, amount: bigint) {
  const result = await getErc20ContractWithPaymentsAddress(currency, signer);
  if (result === null) {
    return Err(new Error("Fail to get erc20"));
  }
  let { erc20, rentalityPayments } = result;
  let allowance = await erc20.allowance(await signer.getAddress(), rentalityPayments);
  if (allowance === amount) return;

  const tx = await erc20.approve(rentalityPayments, BigInt(amount));
  await tx.wait();
}
