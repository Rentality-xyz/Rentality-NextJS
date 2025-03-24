import RentalityGatewayJSON_ABI from "./test/RentalityGateway.v0_2_0.abi.json";
import RentalityGatewayJSON_ADDRESSES from "./test/RentalityGateway.v0_2_0.addresses.json";
import RentalityAdminGatewayJSON_ABI from "./test/RentalityAdminGateway.v0_2_0.abi.json";
import RentalityAdminGatewayJSON_ADDRESSES from "./test/RentalityAdminGateway.v0_2_0.addresses.json";
import RentalityInvestServiceJSON_ADDRESSES from "./test/RentalityInvestment.v0_2_0.addresses.json";
import RentalityInvestServiceJSON_ABI from "./test/RentalityInvestment.v0_2_0.abi.json";
import RentalityLocationVerifierJSON_ADDRESSES from "./test/RentalityLocationVerifier.v0_2_0.addresses.json";
import RentalityLocationVerifierJSON_ABI from "./test/RentalityLocationVerifier.v0_2_0.abi.json";
import RentalityNotificationServiceJSON_ADDRESSES from "./test/RentalityNotificationService.v0_2_0.addresses.json";
import RentalityNotificationServiceJSON_ABI from "./test/RentalityNotificationService.v0_2_0.abi.json";
import RentalityCurrencyConverterJSON_ADDRESSES from "./test/RentalityCurrencyConverter.v0_2_0.addresses.json";
import RentalityCurrencyConverterJSON_ABI from "./test/RentalityCurrencyConverter.v0_2_0.abi.json";
import RentalityRefferalProgramServiceJSON_ABI from "./test/RentalityReferralProgram.v0_2_0.abi.json";
import RentalityRefferalProgramServiceJSON_ADDRESSES from "./test/RentalityReferralProgram.v0_2_0.addresses.json";
import RentalityAiDamageAnalyzeJSON_ABI from "./test/RentalityAiDamageAnalyze.v0_2_0.abi.json";
import RentalityAiDamageAnalyzeServiceJSON_ADDRESSES from "./test/RentalityAiDamageAnalyze.v0_2_0.addresses.json";
import RentalityUserServiceJSON_ABI from "./test/RentalityUserService.v0_2_0.abi.json";
import RentalityUserServiceJSON_ADDRESSES from "./test/RentalityUserService.v0_2_0.addresses.json";
import { Contract, Signer } from "ethers";
import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { logger } from "@/utils/logger";

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
  notificationService: {
    addresses: RentalityNotificationServiceJSON_ADDRESSES.addresses,
    abi: RentalityNotificationServiceJSON_ABI.abi,
  },
  verifierService: {
    addresses: RentalityLocationVerifierJSON_ADDRESSES.addresses,
    abi: RentalityLocationVerifierJSON_ABI.abi,
  },
  investService: {
    addresses: RentalityInvestServiceJSON_ADDRESSES.addresses,
    abi: RentalityInvestServiceJSON_ABI.abi,
  },
  currencyConverter: {
    addresses: RentalityCurrencyConverterJSON_ADDRESSES.addresses,
    abi: RentalityCurrencyConverterJSON_ABI.abi,
  },
  refferalPogram: {
    addresses: RentalityRefferalProgramServiceJSON_ADDRESSES.addresses,
    abi: RentalityRefferalProgramServiceJSON_ABI.abi,
  },
  aiDamageAnalyze: {
    addresses: RentalityAiDamageAnalyzeServiceJSON_ADDRESSES.addresses,
    abi: RentalityAiDamageAnalyzeJSON_ABI.abi,
  },
  userService: {
    addresses: RentalityUserServiceJSON_ADDRESSES.addresses,
    abi: RentalityUserServiceJSON_ABI.abi,
  },
};

export async function getEtherContractWithSigner(contract: keyof typeof rentalityContracts, signer: Signer) {
  try {
    if (!signer) {
      logger.error("getEtherContract error: signer is null");
      return null;
    }

    const chainId = Number((await signer.provider?.getNetwork())?.chainId);
    if (!getExistBlockchainList().find((i) => i.chainId === chainId)) {
      logger.error(`getEtherContract error: Chain id ${chainId} is not supported`);
      return null;
    }

    const selectedChain = rentalityContracts[contract].addresses.find((i) => i.chainId === chainId);

    if (!selectedChain) {
      logger.error(`getEtherContract error: ${contract} address for chainId ${chainId} is not found`);
      return null;
    }
    const etherContract = new Contract(selectedChain.address, rentalityContracts[contract].abi, signer);
    return etherContract;
  } catch (error) {
    logger.error("getEtherContract error:" + error);
    return null;
  }
}

export function hasContractForChainId(chainId: number) {
  return rentalityContracts.gateway.addresses.find((i) => i.chainId === chainId) !== undefined;
}

export function getContractAddress(contract: keyof typeof rentalityContracts, chainId: number) {
  try {
    if (!getExistBlockchainList().find((i) => i.chainId === chainId)) {
      logger.error(`getEtherContract error: Chain id ${chainId} is not supported`);
      return null;
    }

    const selectedChain = rentalityContracts[contract].addresses.find((i) => i.chainId === chainId);

    if (!selectedChain) {
      logger.error(`getEtherContract error: ${contract} address for chainId ${chainId} is not found`);
      return null;
    }
    return selectedChain.address;
  } catch (error) {
    logger.error("get address error error:" + error);
    return null;
  }
}

export default rentalityContracts;
