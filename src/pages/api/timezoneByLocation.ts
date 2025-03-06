import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { isEmpty } from "@/utils/string";
import { getTimeZoneIdFromGoogleByLocation } from "@/utils/timezone";
import type { NextApiRequest, NextApiResponse } from "next";

export type TimezoneByLocationRequest = {
  latitude: number;
  longitude: number;
};

export type TimezoneResponse = { timezone: string } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<TimezoneResponse>) {
  const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    logger.error("TimezoneByLocation error: GOOGLE_MAPS_API_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const parseQueryResult = parseQuery(req);
  if (!parseQueryResult.ok) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }

  const { latitude, longitude } = parseQueryResult.value;
  logger.info(`\nCalling TimezoneByLocation API with params: 'latitude'=${latitude} | 'longitude'=${longitude}`);

  const timeZoneIdResult = await getTimeZoneIdFromGoogleByLocation(latitude, longitude, GOOGLE_MAPS_API_KEY);

  if (!timeZoneIdResult.ok) {
    logger.error(timeZoneIdResult.error);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  res.status(200).json({ timezone: timeZoneIdResult.value });
  return;
}

function parseQuery(req: NextApiRequest): Result<TimezoneByLocationRequest, string> {
  const { latitude: latitudeQuery, longitude: longitudeQuery } = req.query;
  const latitude = typeof latitudeQuery === "string" ? Number(latitudeQuery) : -1;
  const longitude = typeof longitudeQuery === "string" ? Number(longitudeQuery) : -1;

  if (Number.isNaN(latitude) || latitude === -1) {
    return Err("'latitude' is not provided or is not a number");
  }
  if (Number.isNaN(longitude) || longitude === -1) {
    return Err("'longitude' is not provided or is not a number");
  }

  return Ok({ latitude, longitude });
}
