import { ethers, hashMessage } from "ethers";

const abi = ["function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)"];

export async function verifySignature(
  address: string,
  message: string,
  signature: string,
  provider: ethers.Provider
): Promise<boolean> {
  const contract = new ethers.Contract(address, abi, provider);
  const hash = hashMessage(message);
  const result = await contract.isValidSignature(hash, signature);
  return result === "0x1626ba7e";
}

export async function isContract(address: string, provider: ethers.Provider): Promise<boolean> {
  const code = await provider.getCode(address);
  if (code === undefined) return false;
  const codeSize = code.length - 2;
  return codeSize !== 0;
}
