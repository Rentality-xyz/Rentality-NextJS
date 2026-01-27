import { NextApiRequest, NextApiResponse } from "next";
import { Err, Ok, Result } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { processEvents } from "../utils/processEvents";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";

type ProcessBlockchainEventsParams = {
  chainIds: number[];
  authToken: string;
};

async function processBlockchainEventsHandler(req: NextApiRequest, res: NextApiResponse, baseUrl: string) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const requestResult = validateRequest(req);
    if (!requestResult.ok) {
      logger.error(`processBlockchainEventsHandler validation error: ${requestResult.error.message}`);
      res.status(400).json({ error: "Validation error: " + requestResult.error.message });
      return;
    }

    const envsResult = validateEnvs(requestResult.value.chainIds);
    if (!envsResult.ok) {
      logger.error(`analyzeDamagesHandler env validation error: ${envsResult.error.message}`);
      res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
      return;
    }

    const authResult = validateAuthToken(requestResult.value.authToken);
    if (!authResult.ok) {
      logger.error(`processBlockchainEventsHandler auth error: ${authResult.error.message}`);
      res.status(401).json({ error: authResult.error.message });
      return;
    }

    logger.info(`\nCalling processBlockchainEvents API for ${JSON.stringify(requestResult.value.chainIds)}} chain ids`);

    for (const chainId of requestResult.value.chainIds) {
      if (!chainId || typeof chainId !== "number" || chainId <= 0) continue;

      const result = await processEvents(chainId, baseUrl);

      if (!result.ok) {
        logger.error(
          `processBlockchainEventsHandler error: Failed to process events for chainId ${chainId}:`,
          result.error
        );
      }
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    logger.error("processBlockchainEventsHandler error: Unexpected error:", error);
    return res.status(500).json({
      error: "Internal dimo error",
    });
  }
}

function validateRequest(req: NextApiRequest): Result<ProcessBlockchainEventsParams> {
  const { chainIds: chainIdsString, authToken } = req.query;

  if (chainIdsString === undefined || typeof chainIdsString !== "string") {
    return Err(new Error("chainIds is missing or not a string"));
  }
  const chainIds = chainIdsString
    .split(",")
    .map((chainId) => parseInt(chainId, 10))
    .filter((chainId) => !isNaN(chainId) && chainId > 0);
  if (chainIds.length === 0) {
    return Err(new Error("chainIds should contain at least one valid chain id"));
  }
  if (authToken === undefined || typeof authToken !== "string") {
    return Err(new Error("Auth token is missing"));
  }

  return Ok({ chainIds, authToken });
}

function validateEnvs(chainIds: number[]): Result {
  const privateKey = env.MANAGER_PRIVATE_KEY;
  if (isEmpty(privateKey)) {
    return Err(new Error("MANAGER_PRIVATE_KEY was not set"));
  }

  for (const chainId of chainIds) {
    const providerApiUrl = getProviderApiUrlFromEnv(chainId);
    if (isEmpty(providerApiUrl)) {
      return Err(new Error(`API URL for chain id ${chainId} was not set`));
    }
  }
  return Ok(true);
}

function validateAuthToken(authToken: string): Result {
  const envAuthToken = env.API_AUTH_TOKEN;
  if (isEmpty(envAuthToken)) {
    return Err(new Error("MANAGER_PRIVATE_KEY was not set"));
  }

  if (authToken !== envAuthToken) {
    return Err(new Error("user is not authorized"));
  }

  return Ok(true);
}

export default processBlockchainEventsHandler;
