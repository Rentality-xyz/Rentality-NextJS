import { env } from "@/utils/env";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { Err, Ok, Result } from "@/model/utils/result";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityGatewayContract } from "@/features/blockchain/models/IRentalityGateway";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { logger } from "@/utils/logger";

const CODE_EXPIRATION_TIME_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    logger.error("compareSmsVerificationCode error: method not allowed");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userAddress, phoneNumber, enteredCode, smsHash, timestamp, chainId } = req.body;

  if (
    !userAddress ||
    typeof userAddress !== "string" ||
    !phoneNumber ||
    typeof phoneNumber !== "string" ||
    !enteredCode ||
    typeof enteredCode !== "string" ||
    !smsHash ||
    typeof smsHash !== "string" ||
    !timestamp ||
    typeof timestamp !== "number" ||
    !chainId ||
    typeof chainId !== "number"
  ) {
    logger.error("compareSmsVerificationCode error: invalid parameters");
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  const now = Date.now();

  if (now - timestamp > CODE_EXPIRATION_TIME_MS) {
    logger.error("compareSmsVerificationCode error: verification code expired");
    res.status(400).json({ error: "Verification code expired" });
    return;
  }

  const enteredCodeHash = crypto
    .createHmac("sha256", env.VERIFICATION_HMAC_SHA256_SECRET_KEY)
    .update(phoneNumber + enteredCode + timestamp)
    .digest("hex");

  const isVerified = smsHash === enteredCodeHash;

  if (!isVerified) {
    logger.info(`Phone number didn't verified`);
    res.status(200).json({ isVerified: false });
    return;
  }

  const MANAGER_PRIVATE_KEY = env.MANAGER_PRIVATE_KEY;
  if (isEmpty(MANAGER_PRIVATE_KEY)) {
    logger.error("compareSmsVerificationCode error: private key was not set");
    res.status(500).json({ error: "Manager private key was not set" });
    return;
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);

  if (!providerApiUrl) {
    logger.error(`compareSmsVerificationCode error: API URL for chain id ${chainId} was not set`);
    res.status(500).json({ error: `compareSmsVerificationCode error: API URL for chain id ${chainId} was not set` });
    return;
  }

  const saveVerificationStatusResult = await saveVerificationSuccessStatus(
    userAddress,
    phoneNumber,
    MANAGER_PRIVATE_KEY,
    providerApiUrl
  );

  if (!saveVerificationStatusResult.ok) {
    logger.error(`compareSmsVerificationCode error: ${saveVerificationStatusResult.error}`);
    res.status(500).json({ error: saveVerificationStatusResult.error });
    return;
  }

  logger.info(`Phone number verified successfully`);
  res.status(200).json({ isVerified: true });
  return;
}

async function saveVerificationSuccessStatus(
  userAddress: string,
  phoneNumber: string,
  managerPrivateKey: string,
  providerApiUrl: string
): Promise<Result<boolean, string>> {
  if (!userAddress || isEmpty(userAddress)) {
    logger.error("User address is empty");
    return Err("User address  is empty");
  }

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(managerPrivateKey, provider);

  const rentality = (await getEtherContractWithSigner("gateway", wallet)) as unknown as IRentalityGatewayContract;

  if (rentality === null) {
    logger.error("rentality is null");
    return Err("rentality is null");
  }

  try {
    const transaction = await rentality.setPhoneNumber(userAddress, phoneNumber, true);
    await transaction.wait();
    return Ok(true);
  } catch (error) {
    logger.error("saveVerificationSuccessStatus error", error);
    return Err(`saveVerificationSuccessStatus error ${error}`);
  }
}
