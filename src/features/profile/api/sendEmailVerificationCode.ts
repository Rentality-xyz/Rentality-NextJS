import { env } from "@/utils/env";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { isEmpty } from "@/utils/string";
import { logger } from "@/utils/logger";
import { Err, Ok, Result } from "@/model/utils/result";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { ContractFullKYCInfoDTO } from "@/model/blockchain/schemas";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityAdminGatewayContract } from "@/features/blockchain/models/IRentalityAdminGateway";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEthersContractProxy } from "@/features/blockchain/models/EthersContractProxy";
import { getEmailVerificationHash } from "../utils/email";

export type SendEmailVerificationCodeBodyParams = {
  walletAddress: string;
  chainId: number;
};

export default async function sendEmailVerificationCodeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  checkUrlBase: string
) {
  if (req.method !== "POST") {
    logger.error(`sendEmailVerificationCode error: method not allowed`);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const requestResult = validateRequest(req);
  if (!requestResult.ok) {
    logger.error(`sendEmailVerificationCodeHandler validation error: ${requestResult.error.message}`);
    res.status(400).json({ error: "Validation error: " + requestResult.error.message });
    return;
  }

  const { walletAddress, chainId } = requestResult.value;

  const envsResult = validateEnvs(chainId);
  if (!envsResult.ok) {
    logger.error(`sendEmailVerificationCodeHandler env validation error: ${envsResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const getUserInfoResult = await getUserInfo(walletAddress, chainId);
  if (!getUserInfoResult.ok) {
    logger.error(`sendEmailVerificationCodeHandler error: ${getUserInfoResult.error.message}`);
    res.status(404).json({ error: "Email for user was not found" });
    return;
  }

  if (getUserInfoResult.value.isEmailVerified) {
    logger.error(`sendEmailVerificationCodeHandler error: Email for user is already verified`);
    res.status(400).json({ error: "Email for user is already verified" });
    return;
  }

  const { email } = getUserInfoResult.value.additionalKYC;

  const generateVerificationLinkResult = getVerificationLink(walletAddress, chainId, email, checkUrlBase);
  if (!generateVerificationLinkResult.ok) {
    logger.error(`sendEmailVerificationCodeHandler error: ${generateVerificationLinkResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const sendVerificationLinkResult = await sendVerificationLink(email, generateVerificationLinkResult.value);
  if (!sendVerificationLinkResult.ok) {
    logger.error(`sendEmailVerificationCodeHandler error: ${sendVerificationLinkResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  logger.info(`Email verification link was sent successfully`);
  res.status(200).json({ success: true });
  return;
}

function validateRequest(req: NextApiRequest): Result<SendEmailVerificationCodeBodyParams> {
  const { walletAddress, chainId } = req.body;

  if (!walletAddress || typeof walletAddress !== "string") {
    return Err(new Error("walletAddress is missing or not a string"));
  }
  if (chainId == undefined || typeof chainId !== "number") {
    return Err(new Error("chainId is missing or not a number"));
  }

  return Ok({ walletAddress, chainId });
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

async function getUserInfo(walletAddress: string, chainId: number): Promise<Result<ContractFullKYCInfoDTO>> {
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
  const rentalityAdmin = (await getEtherContractWithSigner(
    "admin",
    wallet
  )) as unknown as IRentalityAdminGatewayContract;
  if (!rentalityAdmin) {
    return Err(new Error("rentalityAdmin is null"));
  }

  const adminProxy = getEthersContractProxy(rentalityAdmin);

  return adminProxy.getUserFullKYCInfo(walletAddress);
}

function getVerificationLink(
  walletAddress: string,
  chainId: number,
  email: string,
  checkUrlBase: string
): Result<string> {
  const VERIFICATION_HMAC_SHA256_SECRET_KEY = env.VERIFICATION_HMAC_SHA256_SECRET_KEY;
  if (isEmpty(VERIFICATION_HMAC_SHA256_SECRET_KEY)) {
    return Err(new Error("VERIFICATION_HMAC_SHA256_SECRET_KEY was not set"));
  }

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const timestamp = Date.now();

  const hash = getEmailVerificationHash(
    VERIFICATION_HMAC_SHA256_SECRET_KEY,
    walletAddress,
    email,
    verificationCode,
    timestamp,
    chainId
  );

  const params = new URLSearchParams({
    walletAddress,
    email,
    verificationCode: verificationCode.toString(),
    hash,
    timestamp: timestamp.toString(),
    chainId: chainId.toString(),
  });

  return Ok(`${checkUrlBase}?${params.toString()}`);
}

function sendVerificationLink(email: string, link: string): Result<boolean> {
  if (isEmpty(email)) {
    return Err(new Error("email is empty"));
  }
  if (isEmpty(link)) {
    return Err(new Error("link is empty"));
  }

  const message = {
    subject: "Verify your email address",
    html: `
    <div style="font-family: "Montserrat", Arial, sans-serif; line-height: 1.5;">
      <h2>Welcome, Rentality user!</h2>
      <p>Thank you for signing up on Rentality platform. Please verify your email address by clicking the button below:</p>
      <p>
        <a href="${link}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>If you did not create this account, you can safely ignore this email.</p>
    </div>
  `,
    text: `
    Welcome, Rentality user!

    Thank you for signing up on Rentality platform. Please verify your email address by clicking the link below:

    ${link}

    If you did not create this account, you can safely ignore this email.
  `,
  };

  console.log("sendVerificationLink call", JSON.stringify({ message }, null, 2));
  return Ok(true);
}
