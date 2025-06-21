import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { getQueryTrips, GetTripsResponse, TripEntity } from "../queryTrips";
import { GetClaimInfosResponse, queryClaimInfos } from "../getQueryClaims";

export type QueryParams = {
  isHost: string;
  walletAddress: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetClaimInfosResponse | { error: string }>) {
    const { isHost, walletAddress } = req.query as Partial<QueryParams>

    const isHostBool = isHost === 'true' 

    if (typeof isHost !== "string" || typeof walletAddress !== "string") {
      logger.error("API queryClaims error: Invalid query parameters");
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    let claims = await queryClaimInfos(isHostBool, walletAddress)
    if (!claims) {
      logger.error("API queryClaims error: Failed to fetch claims");
      return res.status(500).json({ error: "Failed to fetch claims" });
    }

    res.status(200).json(claims);

}