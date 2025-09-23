import { NextApiRequest, NextApiResponse } from "next";
import { ethers, JsonRpcProvider, Contract } from "ethers";
import { EAS } from "@ethereum-attestation-service/eas-sdk";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import rentalityContracts from "@/abis";
import { logger } from "@/utils/logger";

const EASContractAddress =  "0x4200000000000000000000000000000000000021";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    logger.error("Coinbase verification: method not allowed");
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const { walletAddress, chainId } = req.body ?? {};

  if (
    typeof walletAddress !== "string" ||
    typeof chainId !== "number"
  ) {
    logger.error("Coinbase verification: invalid params");
    res.status(400).json({ ok: false, error: "Invalid parameters" });
    return;
  }

  if (!ethers.isAddress(walletAddress)) {
    res.status(400).json({ ok: false, error: "Invalid walletAddress" });
    return;
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);
  if (!providerApiUrl) {
    logger.error(`Coinbase verification: provider url not set for chainId=${chainId}`);
    res.status(500).json({ ok: false, error: `API URL for chainId ${chainId} is not configured` });
    return;
  }

  try {
    const provider = new JsonRpcProvider(providerApiUrl);

    const coinbaseContractService = rentalityContracts.coinbaseContractService;
    if (!coinbaseContractService?.addresses || !Array.isArray(coinbaseContractService.addresses)) {
      logger.error("Coinbase verification: coinbaseContractService addresses are missing");
      res.status(500).json({ ok: false, error: "coinbaseContractService addresses not configured" });
      return;
    }
    const indexerInfo = coinbaseContractService.addresses.find((i: any) => Number(i.chainId) === chainId);
    if (!indexerInfo?.address) {
      logger.error(`Coinbase verification: coinbase indexer address not found for chainId=${chainId}`);
      res.status(500).json({ ok: false, error: "Coinbase indexer address not found for this chain" });
      return;
    }

    const coinbaseSchemaService = rentalityContracts.coinbaseSchemaService;
    if (!coinbaseSchemaService?.addresses || !Array.isArray(coinbaseSchemaService.addresses)) {
      logger.error("Coinbase verification: coinbaseSchemaService addresses are missing");
      res.status(500).json({ ok: false, error: "coinbaseSchemaService addresses not configured" });
      return;
    }
    const schemaInfo = coinbaseSchemaService.addresses.find((i: any) => Number(i.chainId) === chainId);
    if (!schemaInfo?.address) {
      logger.error(`Coinbase verification: coinbase schema address not found for chainId=${chainId}`);
      res.status(500).json({ ok: false, error: "Coinbase schema address not found for this chain" });
      return;
    }

    const indexer = new Contract(indexerInfo.address, coinbaseContractService.abi, provider);
    const uid: string = await indexer.getAttestationUid(walletAddress, schemaInfo.address);

    if (!uid) {
      res.status(200).json({ ok: false, error: "Attestation not found" });
      return;
    }

    const eas = new EAS(EASContractAddress);
    eas.connect(provider);
    const attestation = await eas.getAttestation(uid);

    res.status(200).json({ ok: true, result: attestation.revocable });
  } catch (err: any) {
    logger.error("Coinbase verification: unhandled error", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
}
