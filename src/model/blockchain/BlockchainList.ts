const chainIdToHex = (chainId: number) => {
  return "0x" + chainId.toString(16);
};

export const blockchainList: BlockchainBaseInfo[] = [
  {
    name: "Ethereum Seposia",
    shortName: "Sepolia",
    chainId: 11155111,
    chainIdHexString: "0xaa36a7",
    isTestnet: true,
    logo: "chainLogoEthereum.svg",
  },
  {
    name: "Polygon Mumbai",
    shortName: "Mumbai",
    chainId: 80001,
    chainIdHexString: "0x13881",
    isTestnet: true,
    logo: "chainLogoPolygon.svg",
  },
  {
    name: "Base Seposia Testnet",
    shortName: "Base Seposia",
    chainId: 84532,
    chainIdHexString: "0x14a34",
    isTestnet: true,
    logo: "chainLogoBase.svg",
  },
  // {
  //   name: "Fuse Sparknet",
  //   shortName: "Fuse Sparknet",
  //   chainId: 123,
  //   chainIdHexString: "0x7b",
  //   isTestnet: true,
  //   logo: "chainLogoFuse.svg",
  // },
  {
    name: "Ganache",
    shortName: "Ganache",
    chainId: 1337,
    chainIdHexString: "0x539",
    isTestnet: true,
    logo: "chainLogoGanache.svg",
  },
];

type BlockchainBaseInfo = {
  name: string;
  shortName: string;
  chainId: number;
  chainIdHexString: string;
  isTestnet: boolean;
  logo: string;
};
