import { hasContractForChainId } from "@/abis";
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

  //Localhost
  { ...getBlockchainInfoFromViem(localhostGanache), shortName: "Ganache", logo: "chainLogoGanache.svg" },
];

export const getExistBlockchainList = (): BlockchainBaseInfo[] => {
  var isIncludeTestnets = process.env.NEXT_PUBLIC_INCLUDE_TESTNETS?.toLowerCase?.() === "true";
  var isIncludeLocalnets = process.env.NEXT_PUBLIC_INCLUDE_LOCALNETS?.toLowerCase?.() === "true";

  return allSupportedBlockchainList.filter(
    (bc) =>
      hasContractForChainId(bc.chainId) &&
      (!bc.isTestnet || isIncludeTestnets) &&
      (bc.chainId !== 1337 || isIncludeLocalnets)
  );
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
