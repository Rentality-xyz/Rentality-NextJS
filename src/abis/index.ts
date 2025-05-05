import RentalityGatewayJSON_ABI from "./diamondContract.v0_2_0.abi.json";
import RentalityGatewayJSON_ADDRESSES from "./RentalityGateway.v0_2_0.addresses.json";
import RentalityLocationVerifierJSON_ADDRESSES from "./RentalityLocationVerifier.v0_2_0.addresses.json";
import RentalityLocationVerifierJSON_ABI from "./RentalityLocationVerifier.v0_2_0.abi.json";

import { Contract, Signer } from "ethers";
import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { logger } from "@/utils/logger";

export const SMARTCONTRACT_VERSION = "v0_2_0";

const rentalityContracts = {
  gateway: {
    addresses: RentalityGatewayJSON_ADDRESSES.addresses,
    abi: RentalityGatewayJSON_ABI.abi,
  },
  verifierService: {
    addresses: RentalityLocationVerifierJSON_ADDRESSES.addresses,
    abi: RentalityLocationVerifierJSON_ABI.abi,
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
  return chainId !== 204 && rentalityContracts.gateway.addresses.find((i) => i.chainId === chainId) !== undefined;
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
