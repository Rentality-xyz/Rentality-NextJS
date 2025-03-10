import { ContractSignedLocationInfo } from "@/model/blockchain/schemas";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { signLocationInfo } from "@/utils/signLocationInfo";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getLocationInfoFromGoogleByAddress, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { logger } from "@/utils/logger";

export type SignLocationRequest = {
  address: string;
};

export type SignLocationResponse =
  | ContractSignedLocationInfo
  | {
      error: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignLocationResponse>) {
  const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    logger.error("SignLocation error: GOOGLE_MAPS_API_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const SIGNER_PRIVATE_KEY = env.SIGNER_PRIVATE_KEY;
  if (isEmpty(SIGNER_PRIVATE_KEY)) {
    logger.error("SignLocation error: SIGNER_PRIVATE_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const parseQueryResult = parseQuery(req);
  if (!parseQueryResult.ok) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }

  const { address, chainId, providerApiUrl } = parseQueryResult.value;
  logger.info(`\nCalling signLocation API with params: 'address'=${address} | 'chainId'=${chainId}`);

  const locationInfoResult = await getLocationInfoFromGoogleByAddress(address, GOOGLE_MAPS_API_KEY);

  if (!locationInfoResult.ok) {
    logger.error(locationInfoResult.error);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const contractLocationInfo = mapLocationInfoToContractLocationInfo(locationInfoResult.value);
  const provider = new JsonRpcProvider(providerApiUrl);
  const signer = new Wallet(SIGNER_PRIVATE_KEY, provider);
  const signature = await signLocationInfo(signer, contractLocationInfo);

  res.status(200).json({ locationInfo: contractLocationInfo, signature });
  return;
}

function parseQuery(
  req: NextApiRequest
): Result<SignLocationRequest & { chainId: number; providerApiUrl: string }, string> {
  const { address: addressQuery, chainId: chainIdQuery } = req.query;
  const address = typeof addressQuery === "string" ? addressQuery : "";
  const chainId = typeof chainIdQuery === "string" ? Number(chainIdQuery) : 0;

  if (isEmpty(address)) {
    return Err("'address' is not provided or empty");
  }
  if (Number.isNaN(chainId) || chainId === 0) {
    return Err("'chainId' is not provided or is not a number");
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);
  if (!providerApiUrl) {
    logger.error(`API signLocation error: API URL for chain id ${chainId} was not set`);
    return Err(`Chain id ${chainId} is not supported`);
  }

  return Ok({ address, chainId, providerApiUrl });
}
