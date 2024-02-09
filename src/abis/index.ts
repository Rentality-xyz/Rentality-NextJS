import RentalityGatewayJSON_ABI from "./RentalityGateway.v0_16_1.abi.json";
import RentalityGatewayJSON_ADDRESSES from "./RentalityGateway.v0_16_1.addresses.json";
import RentalityAdminGatewayJSON_ABI from "./RentalityAdminGateway.v0_16_1.abi.json";
import RentalityAdminGatewayJSON_ADDRESSES from "./RentalityAdminGateway.v0_16_1.addresses.json";
import RentalityCurrencyConverterJSON_ABI from "./RentalityCurrencyConverter.v0_16_1.abi.json";
import RentalityCurrencyConverterJSON_ADDRESSES from "./RentalityCurrencyConverter.v0_16_1.addresses.json";
import RentalityChatHelperJSON_ABI from "./RentalityChatHelper.v0_16_1.abi.json";
import RentalityChatHelperJSON_ADDRESSES from "./RentalityChatHelper.v0_16_1.addresses.json";
import { Contract, ethers } from "ethers";

export const SMARTCONTRACT_VERSION = "v0_16_0";

const rentalityContracts = {
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

export async function getEtherContract(contract: keyof typeof rentalityContracts) {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      console.error("getEtherContract error: Ethereum wallet is not found");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = await provider.getSigner();
    const chainId = await signer.getChainId();

    const selectedChain = rentalityContracts[contract].addresses.find((i) => i.chainId === chainId);

    if (!selectedChain) {
      console.error(`getEtherContract error: ${contract} address for chainId ${chainId} is not found`);
      return null;
    }
    const etherContract = new Contract(selectedChain.address, rentalityContracts[contract].abi, signer);
    return etherContract;

    // switch (contract) {
    //   case "admin":
    //     return etherContract as unknown as IRentalityAdminGateway;
    //   case "chatHelper":
    //     return etherContract as unknown as IRentalityChatHelperContract;
    //   case "currencyConverter":
    //     return etherContract; // as unknown as IRentalityCurrencyConverter;
    //   case "gateway":
    //     return etherContract as unknown as IRentalityContract;
    // }
  } catch (e) {
    console.error("getEtherContract error:" + e);
    return null;
  }
}

export function hasContractForChainId(chainId: number) {
  return rentalityContracts.gateway.addresses.find((i) => i.chainId === chainId) !== undefined;
}

export default rentalityContracts;
