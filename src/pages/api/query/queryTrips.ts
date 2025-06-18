import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { getQueryTrips, GetTripsResponse, TripEntity } from "../queryTrips";

export type QueryParams = {
  isHost: string;
  walletAddress: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetTripsResponse | { error: string }>) {
    const { isHost, walletAddress } = req.query as Partial<QueryParams>

    const isHostBool = isHost === 'true' 

    if (typeof isHost !== "string" || typeof walletAddress !== "string") {
      logger.error("API queryTrips error: Invalid query parameters");
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    let trips = await getQueryTrips(isHostBool, walletAddress)
    if (!trips) {
      logger.error("API queryTrips error: Failed to fetch trips");
      return res.status(500).json({ error: "Failed to fetch trips" });
    }

    res.status(200).json(trips);

}