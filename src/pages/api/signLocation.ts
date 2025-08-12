import { ContractLocationInfo, ContractSignedLocationInfo } from "@/model/blockchain/schemas";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { signLocationInfo } from "@/utils/signLocationInfo";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/utils/logger";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";

export type SignLocationRequest = {
  contractLocationInfo: ContractLocationInfo;
  chainId: number;
};

export type SignLocationResponse =
  | ContractSignedLocationInfo
  | {
      error: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignLocationResponse>) {

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const SIGNER_PRIVATE_KEY = env.SIGNER_PRIVATE_KEY;
  if (isEmpty(SIGNER_PRIVATE_KEY)) {
    logger.error("SignLocation error: SIGNER_PRIVATE_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const parsed = parseBody(req);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { contractLocationInfo, chainId } = parsed.value;

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);
  if (!providerApiUrl) {
    logger.error(`API signLocation error: API URL for chain id ${chainId} was not set`);
    res.status(400).json({ error: `Chain id ${chainId} is not supported` });
    return;
  }

  const provider = new JsonRpcProvider(providerApiUrl);
  const signer = new Wallet(SIGNER_PRIVATE_KEY, provider);
  const signature = await signLocationInfo(signer, contractLocationInfo);

  res.status(200).json({ locationInfo: contractLocationInfo, signature });
  return;
}

function parseBody(req: NextApiRequest): Result<SignLocationRequest, string> {
  const { contractLocationInfo, chainId } = (req.body ?? {}) as Partial<SignLocationRequest>;

  if (!contractLocationInfo) {
    return Err("'contractLocationInfo' is required");
  }
  if (typeof chainId !== "number" || !Number.isFinite(chainId) || chainId <= 0) {
    return Err("'chainId' is required and must be a positive number");
  }

  return Ok({ contractLocationInfo, chainId });
}
