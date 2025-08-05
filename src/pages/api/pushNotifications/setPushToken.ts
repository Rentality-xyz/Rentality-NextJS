import { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/utils/logger";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { Err, Ok, Result } from "@/model/utils/result";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityGatewayContract } from "@/features/blockchain/models/IRentalityGateway";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    logger.error("setPushToken error: method not allowed");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userAddress, pushToken, chainId } = req.body;

  if (
    !userAddress ||
    typeof userAddress !== "string" ||
    !pushToken ||
    typeof pushToken !== "string" ||
    !chainId ||
    typeof chainId !== "number"
  ) {
    logger.error("setPushToken error: invalid parameters");
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  const MANAGER_PRIVATE_KEY = env.MANAGER_PRIVATE_KEY;
  if (isEmpty(MANAGER_PRIVATE_KEY)) {
    logger.error("setPushToken error: private key was not set");
    res.status(500).json({ error: "Manager private key was not set" });
    return;
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);

  if (!providerApiUrl) {
    logger.error(`setPushToken error: API URL for chain id ${chainId} was not set`);
    res.status(500).json({ error: `setPushToken error: API URL for chain id ${chainId} was not set` });
    return;
  }

  const setPushTokenResult = await setPushToken(
    userAddress,
    pushToken,
    MANAGER_PRIVATE_KEY,
    providerApiUrl
  );

  if (!setPushTokenResult.ok) {
    logger.error(`setPushToken error: ${setPushTokenResult.error}`);
    res.status(500).json({ error: setPushTokenResult.error });
    return;
  }

  logger.info(`Push token was set successfully`);
  res.status(200);
  return;
}

async function setPushToken(
  userAddress: string,
  pushToken: string,
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
    const transaction = await rentality.setPushToken(userAddress, pushToken);
    await transaction.wait();
    return Ok(true);
  } catch (error) {
    logger.error("setPushToken error", error);
    return Err(`setPushToken error ${error}`);
  }
}