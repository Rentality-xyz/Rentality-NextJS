import { hasContractForChainId } from "@/abis";
import { defineChain } from "viem";
import { mainnet, sepolia, polygonMumbai, baseSepolia, optimismSepolia, fuseSparknet, Chain } from "viem/chains";

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

export const allSupportedBlockchainList: BlockchainBaseInfo[] = [
  {
    name: "Ethereum",
    shortName: "Ethereum",
    chainId: 1,
    chainIdHexString: "0x1",
    isTestnet: false,
    logo: "chainLogoEthereum.svg",
    viemChain: mainnet,
  },
  {
    name: "Ethereum Seposia",
    shortName: "Sepolia",
    chainId: 11155111,
    chainIdHexString: "0xaa36a7",
    isTestnet: true,
    logo: "chainLogoEthereum.svg",
    viemChain: sepolia,
  },
  {
    name: "Polygon Mumbai",
    shortName: "Mumbai",
    chainId: 80001,
    chainIdHexString: "0x13881",
    isTestnet: true,
    logo: "chainLogoPolygon.svg",
    viemChain: polygonMumbai,
  },
  {
    name: "Base Seposia Testnet",
    shortName: "Base Seposia",
    chainId: 84532,
    chainIdHexString: "0x14a34",
    isTestnet: true,
    logo: "chainLogoBase.svg",
    viemChain: baseSepolia,
  },
  {
    name: "Optimism Sepolia Testnet",
    shortName: "Optimism Sepolia",
    chainId: 11155420,
    chainIdHexString: "0xaa37dc",
    isTestnet: true,
    logo: "chainLogoOptimism.svg",
    viemChain: optimismSepolia,
  },
  {
    name: "Fuse Sparknet",
    shortName: "Fuse Sparknet",
    chainId: 123,
    chainIdHexString: "0x7b",
    isTestnet: true,
    logo: "chainLogoFuse.svg",
    viemChain: fuseSparknet,
  },
  {
    name: "Ganache",
    shortName: "Ganache",
    chainId: 1337,
    chainIdHexString: "0x539",
    isTestnet: true,
    logo: "chainLogoGanache.svg",
    viemChain: localhostGanache,
  },
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
