import { DEFAULT_NETWORK_NAME } from "@/utils/constants";

type EthereumInfo = undefined | null | { networkName: string };

export default function getNetworkName(ethInfo: EthereumInfo) {
  return ethInfo ? ethInfo.networkName : DEFAULT_NETWORK_NAME;
}
