import RentalityGatewayJSON_ABI from "./RentalityGateway.v0_2_0.abi.json";
import RentalityGatewayJSON_ADDRESSES from "./RentalityGateway.v0_2_0.addresses.json";
import RentalityAdminGatewayJSON_ABI from "./RentalityAdminGateway.v0_2_0.abi.json";
import RentalityAdminGatewayJSON_ADDRESSES from "./RentalityAdminGateway.v0_2_0.addresses.json";
import RentalityInvestServiceJSON_ADDRESSES from "./RentalityInvestment.v0_2_0.addresses.json";
import RentalityInvestServiceJSON_ABI from "./RentalityInvestment.v0_2_0.abi.json";
import RentalityLocationVerifierJSON_ADDRESSES from "./RentalityLocationVerifier.v0_2_0.addresses.json";
import RentalityLocationVerifierJSON_ABI from "./RentalityLocationVerifier.v0_2_0.abi.json";
import RentalityNotificationServiceJSON_ADDRESSES from "./RentalityNotificationService.v0_2_0.addresses.json";
import RentalityNotificationServiceJSON_ABI from "./RentalityNotificationService.v0_2_0.abi.json";
import RentalityCurrencyConverterJSON_ADDRESSES from "./RentalityCurrencyConverter.v0_2_0.addresses.json";
import RentalityCurrencyConverterJSON_ABI from "./RentalityCurrencyConverter.v0_2_0.abi.json";
import RentalityRefferalProgramServiceJSON_ABI from "./RentalityReferralProgram.v0_2_0.abi.json";
import RentalityRefferalProgramServiceJSON_ADDRESSES from "./RentalityReferralProgram.v0_2_0.addresses.json";
import RentalityAiDamageAnalyzeServiceJSON_ABI from "./RentalityAiDamageAnalyzeV2.v0_2_0.abi.json";
import RentalityAiDamageAnalyzeServiceJSON_ADDRESSES from "./RentalityAiDamageAnalyzeV2.v0_2_0.addresses.json";
import RentalityUserServiceJSON_ABI from "./RentalityUserService.v0_2_0.abi.json";
import RentalityUserServiceJSON_ADDRESSES from "./RentalityUserService.v0_2_0.addresses.json";
import RentalityPaymentsServiceJSON_ABI from "./RentalityPaymentService.v0_2_0.abi.json";
import RentalityPaymentsServiceJSON_ADDRESSES from "./RentalityPaymentService.v0_2_0.addresses.json";
import QuoterV2JSON_ADDRESSES from "./QuoterV2.addresses.json";
import QuoterV2JSON_ABI from "./QuoterV2.abi.json";
import UNISWAPFACTORYJSON_ADDRESSES from "./UniswapFactory.addresses.json";
import UNISWAPFACTORYJSON_ABI from "./UniswapFactory.abi.json";

import ERC20JSON_ABI from "./ERC20.abi.json";
import CoinbaseAttestationJSON_ABI from "./CoinbaseAttestation.abi.json"
import CoinbaseAttestationContractJSON_ADDRESSES from "./CoinbaseAttestationContract.addresses.json"
import CoinbaseAttestationSchemaJSON_ADDRESSES from "./CoinbaseAttestationSchema.addresses.json"
import { Contract, ethers, Signer } from "ethers";
import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { logger } from "@/utils/logger";

import { IQuoterV2, IQuoterV2Contract } from "@/features/blockchain/models/IQuoter";
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
    abi: RentalityAiDamageAnalyzeServiceJSON_ABI.abi,
  },
  userService: {
    addresses: RentalityUserServiceJSON_ADDRESSES.addresses,
    abi: RentalityUserServiceJSON_ABI.abi,
  },
  paymentsService: {
    addresses: RentalityPaymentsServiceJSON_ADDRESSES.addresses,
    abi: RentalityPaymentsServiceJSON_ABI.abi,
  },
  coinbaseContractService: {
    addresses: CoinbaseAttestationContractJSON_ADDRESSES.addresses,
    abi: CoinbaseAttestationJSON_ABI.abi,
  },
  coinbaseSchemaService: {
    addresses: CoinbaseAttestationSchemaJSON_ADDRESSES.addresses,
    abi: CoinbaseAttestationJSON_ABI.abi,
  }
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
export async function getErc20ContractWithPaymentsAddress(address: string, signer: Signer) {
  const chainId = Number((await signer.provider?.getNetwork())?.chainId);
  if (!getExistBlockchainList().find((i) => i.chainId === chainId)) {
    logger.error(`getEtherContract error: Chain id ${chainId} is not supported`);
    return null;
  }
  const { addresses } = rentalityContracts.paymentsService;
  const selectedChain = addresses.find((i) => i.chainId === chainId);

  if (!selectedChain) {
    logger.error(`getEtherContract error: payments address for chainId ${chainId} is not found`);
    return null;
  }
  return {
    erc20: new Contract(address, ERC20JSON_ABI.abi, signer),
    rentalityPayments: selectedChain.address,
  };
}

export async function getQuoterContract(signer: Signer) {
  const chainId = Number((await signer.provider?.getNetwork())?.chainId);
  if (!getExistBlockchainList().find((i) => i.chainId === chainId)) {
    logger.error(`getEtherContract error: Chain id ${chainId} is not supported`);
    return null;
  }
  const quoterAddress = QuoterV2JSON_ADDRESSES.addresses.find((i) => i.chainId === chainId);


  if (!quoterAddress) {
    logger.error(`getEtherContract error: quoter address for chainId ${chainId} is not found`);
    return null;
  }
  return {
    quoter: new ethers.Contract(quoterAddress.address, QuoterV2JSON_ABI.abi, signer),
  };
}

export async function getUniswapFactory(signer: Signer) {
  const chainId = Number((await signer.provider?.getNetwork())?.chainId);
  if (!getExistBlockchainList().find((i) => i.chainId === chainId)) {
    logger.error(`getEtherContract error: Chain id ${chainId} is not supported`);
    return null;
  }
  const uniswapAddress = UNISWAPFACTORYJSON_ADDRESSES.addresses.find((i) => i.chainId === chainId);


  if (!uniswapAddress) {
    logger.error(`getEtherContract error: quoter address for chainId ${chainId} is not found`);
    return null;
  }
  return {
    factory: new ethers.Contract(uniswapAddress.address, UNISWAPFACTORYJSON_ABI.abi, signer),
  };

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
