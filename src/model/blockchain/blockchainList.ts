import { hasContractForChainId } from "@/abis";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
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
    default: { http: ["http://127.0.0.1:7545"] },
  },
  testnet: true,
});

const chainIdToHex = (chainId: number) => {
  return "0x" + chainId.toString(16);
};

const getBlockchainInfoFromViem = (viemChain: Chain) => {
  return {
    name: viemChain.name,
    chainId: viemChain.id,
    chainIdHexString: chainIdToHex(viemChain.id),
    isTestnet: viemChain.testnet ?? false,
    viemChain: viemChain,
  };
};

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

export const getExistBlockchainList = (): BlockchainBaseInfo[] => {
  var isIncludeTestnets = env.NEXT_PUBLIC_INCLUDE_TESTNETS === "true";
  var isIncludeLocalnets = env.NEXT_PUBLIC_INCLUDE_LOCALNETS === "true";
  var isIncludeMainnets = env.NEXT_PUBLIC_INCLUDE_MAINNETS === "true";

  return allSupportedBlockchainList.filter(
    (bc) =>
      hasContractForChainId(bc.chainId) &&
      (bc.isTestnet || isIncludeMainnets) &&
      (!bc.isTestnet || bc.chainId === 1337 || isIncludeTestnets) &&
      (bc.chainId !== 1337 || isIncludeLocalnets)
  );
};

export const getBlockCountForSearch = (chainId: number): number => {
  switch (chainId) {
    case mainnet.id:
      return Number.POSITIVE_INFINITY;
    case sepolia.id:
      return Number.POSITIVE_INFINITY;
    case polygon.id:
      return Number.POSITIVE_INFINITY;
    case polygonMumbai.id:
      return Number.POSITIVE_INFINITY;
    case base.id:
      return 1000;
    case baseSepolia.id:
      return 1000;
    case optimism.id:
      return Number.POSITIVE_INFINITY;
    case optimismSepolia.id:
      return Number.POSITIVE_INFINITY;
    case fuse.id:
      return Number.POSITIVE_INFINITY;
    case fuseSparknet.id:
      return Number.POSITIVE_INFINITY;
    case opBNB.id:
      return Number.POSITIVE_INFINITY;
    case opBNBTestnet.id:
      return Number.POSITIVE_INFINITY;
    case localhostGanache.id:
    default:
      return Number.POSITIVE_INFINITY;
  }
};

type BlockchainBaseInfo = {
  name: string;
  shortName: string;
  chainId: number;
  chainIdHexString: string;
  isTestnet: boolean;
  logo: string;
  viemChain: Chain;
};
