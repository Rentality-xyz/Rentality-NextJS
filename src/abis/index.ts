import RentalityGatewayJSON_ABI from "./RentalityGateway.v0_2_0.abi.json";
import RentalityGatewayJSON_ADDRESSES from "./RentalityGateway.v0_2_0.addresses.json";
import RentalityAdminGatewayJSON_ABI from "./RentalityAdminGateway.v0_2_0.abi.json";
import RentalityAdminGatewayJSON_ADDRESSES from "./RentalityAdminGateway.v0_2_0.addresses.json";
import RentalityCurrencyConverterJSON_ABI from "./RentalityCurrencyConverter.v0_2_0.abi.json";
import RentalityCurrencyConverterJSON_ADDRESSES from "./RentalityCurrencyConverter.v0_2_0.addresses.json";
import RentalityChatHelperJSON_ABI from "./RentalityChatHelper.v0_2_0.abi.json";
import RentalityChatHelperJSON_ADDRESSES from "./RentalityChatHelper.v0_2_0.addresses.json";
import RentalityTripServiceJSON_ABI from "./RentalityTripService.v0_2_0.abi.json";
import RentalityTripServiceJSON_ADDRESSES from "./RentalityTripService.v0_2_0.addresses.json";
import RentalityClaimServiceJSON_ABI from "./RentalityClaimService.v0_2_0.abi.json";
import RentalityClaimServiceJSON_ADDRESSES from "./RentalityClaimService.v0_2_0.addresses.json";
import RentalityInvestServiceJSON_ADDRESSES from "./RentalityInvestment.v0_2_0.addresses.json";
import RentalityInvestServiceJSON_ABI from "./RentalityInvestment.v0_2_0.abi.json";
import { Contract, Signer } from "ethers";

export const SMARTCONTRACT_VERSION = "v0_2_0";

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
  tripService: {
    addresses: RentalityTripServiceJSON_ADDRESSES.addresses,
    abi: RentalityTripServiceJSON_ABI.abi,
  },
  claimService: {
    addresses: RentalityClaimServiceJSON_ADDRESSES.addresses,
    abi: RentalityClaimServiceJSON_ABI.abi,
  },
  investService: {
    addresses: RentalityInvestServiceJSON_ADDRESSES.addresses,
    abi:RentalityInvestServiceJSON_ABI.abi,
  },
};
export async function getEtherContractWithSigner(contract: keyof typeof rentalityContracts, signer: Signer) {
  try {
    if (!signer) {
      console.error("getEtherContract error: signer is null");
      return null;
    }

    const chainId = Number((await signer.provider?.getNetwork())?.chainId);

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
