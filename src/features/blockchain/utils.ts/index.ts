import { Chain } from "viem";

export function chainIdToHex(chainId: number) {
  return "0x" + chainId.toString(16);
}

export function getBlockchainInfoFromViem(viemChain: Chain) {
  return {
    name: viemChain.name,
    chainId: viemChain.id,
    chainIdHexString: chainIdToHex(viemChain.id),
    isTestnet: viemChain.testnet ?? false,
    viemChain: viemChain,
  };
}

export function validateType<T extends {}>(obj: T, defaultValue: T): obj is T {
  if (typeof obj !== "object" || obj == null) return false;

  const keys = Object.keys(defaultValue) as Array<keyof T>;
  keys.forEach((key) => {
    if (obj[key] === undefined) {
      console.error(`obj of type ${typeof obj} does not contain property ${key.toString()}`);
      return false;
    }
    if (
      typeof obj[key] !== typeof defaultValue[key] &&
      !(typeof obj[key] === "object" && typeof defaultValue[key] === "bigint")
    ) {
      console.error(`typeof obj[${key.toString()}] is ${typeof obj[key]} but should be ${typeof defaultValue[key]}`);
    }
  });

  return true;
}
