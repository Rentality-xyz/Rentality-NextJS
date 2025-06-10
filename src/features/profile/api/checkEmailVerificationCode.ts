import { env } from "@/utils/env";
import { NextApiRequest, NextApiResponse } from "next";
import { Err, Ok, Result } from "@/model/utils/result";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityGatewayContract } from "@/features/blockchain/models/IRentalityGateway";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { logger } from "@/utils/logger";
import { getEthersContractProxy } from "@/features/blockchain/models/EthersContractProxy";
import { getEmailVerificationHash } from "../utils/email";

const CODE_EXPIRATION_TIME_MS = 1000 * 60 * 24;
type CheckEmailVerificationCodeParams = {
  walletAddress: string;
  email: string;
  verificationCode: string;
  timestamp: number;
  chainId: number;
  hash: string;
};

export default async function checkEmailVerificationCodeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  baseUrl: string
) {
  if (req.method !== "GET") {
    logger.error("checkEmailVerificationCodeHandler error: method not allowed");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const requestResult = validateRequest(req);
  if (!requestResult.ok) {
    logger.error(`checkEmailVerificationCodeHandler validation error: ${requestResult.error.message}`);
    res.status(400).json({ error: "Validation error: " + requestResult.error.message });
    return;
  }

  const { walletAddress, email, chainId } = requestResult.value;

  const envsResult = validateEnvs(chainId);
  if (!envsResult.ok) {
    logger.error(`checkEmailVerificationCodeHandler env validation error: ${envsResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const validateVerificationCodeResult = validateVerificationCode(requestResult.value);
  if (!validateVerificationCodeResult.ok) {
    logger.error(`checkEmailVerificationCodeHandler validation error: ${validateVerificationCodeResult.error.message}`);
    res.status(400).json({ error: "Validation error: " + validateVerificationCodeResult.error.message });
    return;
  }

  const saveVerificationStatusResult = await saveVerificationSuccessStatus(walletAddress, chainId, email);
  if (!saveVerificationStatusResult.ok) {
    logger.error(`checkEmailVerificationCodeHandler error: ${saveVerificationStatusResult.error}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  logger.info(`Email verified successfully`);
  res.writeHead(302, { Location: `${baseUrl}/guest/profile` });
  res.end();
  return;
}

function validateRequest(req: NextApiRequest): Result<CheckEmailVerificationCodeParams> {
  const {
    walletAddress,
    email,
    hash,
    timestamp: timestampString,
    chainId: chainIdString,
    verificationCode,
  } = req.query;

  if (!walletAddress || typeof walletAddress !== "string") {
    return Err(new Error("walletAddress is missing or not a string"));
  }
  if (!email || typeof email !== "string") {
    return Err(new Error("email is missing or not a string"));
  }
  if (!hash || typeof hash !== "string") {
    return Err(new Error("hash is missing or not a string"));
  }
  if (chainIdString == undefined || isNaN(Number(chainIdString))) {
    return Err(new Error("chainId is missing or not a number"));
  }
  if (timestampString == undefined || isNaN(Number(timestampString))) {
    return Err(new Error("timestamp is missing or not a number"));
  }
  if (!verificationCode || typeof verificationCode !== "string") {
    return Err(new Error("verificationCode is missing or not a string"));
  }

  const chainId = Number(chainIdString);
  const timestamp = Number(timestampString);

  return Ok({ walletAddress, email, verificationCode, timestamp, chainId, hash });
}

function validateEnvs(chainId: number): Result<boolean> {
  const VERIFICATION_HMAC_SHA256_SECRET_KEY = env.VERIFICATION_HMAC_SHA256_SECRET_KEY;
  if (isEmpty(VERIFICATION_HMAC_SHA256_SECRET_KEY)) {
    return Err(new Error("VERIFICATION_HMAC_SHA256_SECRET_KEY was not set"));
  }

  const privateKey = env.MANAGER_PRIVATE_KEY;
  if (isEmpty(privateKey)) {
    return Err(new Error("MANAGER_PRIVATE_KEY was not set"));
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);
  if (isEmpty(providerApiUrl)) {
    return Err(new Error(`API URL for chain id ${chainId} was not set`));
  }

  return Ok(true);
}

function validateVerificationCode(params: CheckEmailVerificationCodeParams): Result<boolean> {
  const now = Date.now();

  if (now - params.timestamp > CODE_EXPIRATION_TIME_MS) {
    return Err(new Error("verification code expired"));
  }

  const hashToVerily = getEmailVerificationHash(
    env.VERIFICATION_HMAC_SHA256_SECRET_KEY,
    params.walletAddress,
    params.email,
    params.verificationCode,
    params.timestamp,
    params.chainId
  );

  if (params.hash !== hashToVerily) {
    return Err(new Error("hash is not valid"));
  }

  return Ok(true);
}

async function saveVerificationSuccessStatus(
  walletAddress: string,
  chainId: number,
  email: string
): Promise<Result<boolean>> {
  const privateKey = env.MANAGER_PRIVATE_KEY;
  if (isEmpty(privateKey)) {
    return Err(new Error("MANAGER_PRIVATE_KEY was not set"));
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);
  if (isEmpty(providerApiUrl)) {
    return Err(new Error(`API URL for chain id ${chainId} was not set`));
  }

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(privateKey, provider);
  const rentalityGateway = (await getEtherContractWithSigner(
    "gateway",
    wallet
  )) as unknown as IRentalityGatewayContract;
  if (!rentalityGateway) {
    return Err(new Error("rentalityGateway is null"));
  }

  const gatewayProxy = getEthersContractProxy(rentalityGateway);

  return gatewayProxy.setEmail(walletAddress, email, true);
}
