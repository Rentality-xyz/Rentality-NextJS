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
