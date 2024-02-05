import RentalityGatewayJSON_ABI from "./RentalityGateway.v0_16_0.abi.json";
import RentalityGatewayJSON_ADDRESSES from "./RentalityGateway.v0_16_0.addresses.json";
import RentalityAdminGatewayJSON_ABI from "./RentalityAdminGateway.v0_16_0.abi.json";
import RentalityAdminGatewayJSON_ADDRESSES from "./RentalityAdminGateway.v0_16_0.addresses.json";

import RentalityCurrencyConverterJSON_ABI from "./RentalityCurrencyConverter.v0_16_0.abi.json";
import RentalityCurrencyConverterJSON_ADDRESSES from "./RentalityCurrencyConverter.v0_16_0.addresses.json";
import RentalityChatHelperJSON_ABI from "./RentalityChatHelper.v0_16_0.abi.json";
import RentalityChatHelperJSON_ADDRESSES from "./RentalityChatHelper.v0_16_0.addresses.json";
import { Contract, ethers } from "ethers";

export const SMARTCONTRACT_VERSION = "v0_16_0";

export const rentalityContracts = {
  gateway: {
    addresses: RentalityGatewayJSON_ADDRESSES.addresses,
    abi: RentalityGatewayJSON_ABI.abi,
  },
  admin: {
    addresses: RentalityAdminGatewayJSON_ADDRESSES.addresses,
    abi: RentalityAdminGatewayJSON_ABI.abi,
  },
  currencyConverter: {
    addresses: RentalityCurrencyConverterJSON_ADDRESSES.addresses,
    abi: RentalityCurrencyConverterJSON_ABI.abi,
  },
  chatHelper: {
    addresses: RentalityChatHelperJSON_ADDRESSES.addresses,
    abi: RentalityChatHelperJSON_ABI.abi,
  },
};

export async function getContract(contract: keyof typeof rentalityContracts, signer: ethers.providers.JsonRpcSigner) {
  const chainId = await signer.getChainId();
  const selectedChain = rentalityContracts[contract].addresses.find((i) => i.chainId === chainId);

  if (!selectedChain) {
    console.error(`getContract error: contract address for chainId ${chainId} is not found`);
    return null;
  }

  return new Contract(selectedChain.address, rentalityContracts[contract].abi, signer);
}

export default rentalityContracts;
