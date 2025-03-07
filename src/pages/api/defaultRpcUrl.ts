import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiUrl } from "./publicSearchCars";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

type QueryParams = {
  chainId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiUrl>) {
  try {
    const { chainId: chainIdQuery } = req.query;

    const chainId = typeof chainIdQuery === "string" ? Number.parseInt(chainIdQuery) : env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
    if (!chainId) {
      logger.error("API defaultRpcUrl error: chainId was not provided");
      res.status(400).json({ error: "chainId was not provided" });
      return;
    }

    const providerApiUrl = getProviderApiUrlFromEnv(chainId);
    if (!providerApiUrl) {
      logger.error(`API defaultRpcUrl error: API URL for chain id ${chainId} was not set`);
      res.status(500).json({ error: `API defaultRpcUrl error: API URL for chain id ${chainId} was not set` });
      return;
    }
    const result = {
      url: providerApiUrl,
    };
    res.status(200).json(result);
  } catch (error) {
    logger.error("API defaultRpcUrl error:", error);
    res.status(500).json({ error: "An error occurred during blockchain method call" });
  }
}
