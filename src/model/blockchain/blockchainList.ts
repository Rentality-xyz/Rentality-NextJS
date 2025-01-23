import { hasContractForChainId } from "@/abis";
import { getBlockchainInfoFromViem } from "@/features/blockchain/utils.ts";
import { env } from "@/utils/env";
import { defineChain } from "viem";
import {
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  fuse,
  fuseSparknet,
  opBNB,
  opBNBTestnet,
  Chain,
} from "viem/chains";

const localhostGanache = defineChain({
  id: 1_337,
  name: "Localhost Ganache",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
});

export const allSupportedBlockchainList: BlockchainBaseInfo[] = [
  //Ethereum
  { ...getBlockchainInfoFromViem(mainnet), shortName: "Ethereum", logo: "chainLogoEthereum.svg" },
  { ...getBlockchainInfoFromViem(sepolia), shortName: "Sepolia", logo: "chainLogoEthereum.svg" },

  //Polygon
  { ...getBlockchainInfoFromViem(polygon), shortName: "Polygon", logo: "chainLogoPolygon.svg" },
  { ...getBlockchainInfoFromViem(polygonMumbai), shortName: "Mumbai", logo: "chainLogoPolygon.svg" },

  //Base
  { ...getBlockchainInfoFromViem(base), shortName: "Base", logo: "chainLogoBase.svg" },
  { ...getBlockchainInfoFromViem(baseSepolia), shortName: "Base Seposia", logo: "chainLogoBase.svg" },

  //Optimism
  { ...getBlockchainInfoFromViem(optimism), shortName: "OP Mainnet", logo: "chainLogoOptimism.svg" },
  { ...getBlockchainInfoFromViem(optimismSepolia), shortName: "Optimism Sepolia", logo: "chainLogoOptimism.svg" },

  //Fuse
  { ...getBlockchainInfoFromViem(fuse), shortName: "Fuse", logo: "chainLogoFuse.svg" },
  { ...getBlockchainInfoFromViem(fuseSparknet), shortName: "Fuse Sparknet", logo: "chainLogoFuse.svg" },

  //OpBNB
  { ...getBlockchainInfoFromViem(opBNB), shortName: "opBNB", logo: "chainLogoOpBNB.svg" },
  { ...getBlockchainInfoFromViem(opBNBTestnet), shortName: "opBNB Testnet", logo: "chainLogoOpBNB.svg" },

  //Localhost
  { ...getBlockchainInfoFromViem(localhostGanache), shortName: "Ganache", logo: "chainLogoGanache.svg" },
];

export function getExistBlockchainList(): BlockchainBaseInfo[] {
  var isIncludeTestnets = env.NEXT_PUBLIC_INCLUDE_TESTNETS === "true";
  var isIncludeLocalnets = env.NEXT_PUBLIC_INCLUDE_LOCALNETS === "true";
  var isIncludeMainnets = env.NEXT_PUBLIC_INCLUDE_MAINNETS === "true";

  return allSupportedBlockchainList.filter(
    (bc) =>
      (bc.isTestnet || isIncludeMainnets) &&
      (bc.chainId !== 1337 || isIncludeLocalnets) &&
      (!bc.isTestnet || bc.chainId === 1337 || isIncludeTestnets) &&
      hasContractForChainId(bc.chainId)
  );
}

export function getBlockCountForSearch(chainId: number): number {
  switch (chainId) {
    case base.id:
    case baseSepolia.id:
      return 1000;
    default:
      return Number.POSITIVE_INFINITY;
  }
}

type BlockchainBaseInfo = {
  name: string;
  shortName: string;
  chainId: number;
  chainIdHexString: string;
  isTestnet: boolean;
  logo: string;
  viemChain: Chain;
};
