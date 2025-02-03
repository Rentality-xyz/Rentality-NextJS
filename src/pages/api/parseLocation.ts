import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import type { NextApiRequest, NextApiResponse } from "next";
import { Err, Ok, Result } from "@/model/utils/result";
import { getLocationInfoFromGoogleByAddress } from "@/utils/location";

export type ParseLocationRequest = {
  address: string;
  timestamp?: number;
};

export type ParseLocationResponse =
  | {
      country: string;
      state: string;
      city: string;
      locationLatitude: string;
      locationLongitude: string;
      timeZoneId: string;
    }
  | {
      error: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ParseLocationResponse>) {
  const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    console.error("ParseLocation error: GOOGLE_MAPS_API_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const parseQueryResult = parseQuery(req);
  if (!parseQueryResult.ok) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }

  const { address, timestamp } = parseQueryResult.value;
  console.log(`\nCalling ParseLocation API with params: 'address'=${address} | 'timestamp'=${timestamp}`);

  const locationInfoResult = await getLocationInfoFromGoogleByAddress(address, GOOGLE_MAPS_API_KEY);

  if (!locationInfoResult.ok) {
    console.error(locationInfoResult.error);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  res.status(200).json({
    country: locationInfoResult.value.country,
    state: locationInfoResult.value.state,
    city: locationInfoResult.value.city,
    locationLatitude: locationInfoResult.value.latitude.toFixed(6),
    locationLongitude: locationInfoResult.value.longitude.toFixed(6),
    timeZoneId: locationInfoResult.value.timeZoneId,
  });
  return;
}

function parseQuery(req: NextApiRequest): Result<ParseLocationRequest, string> {
  const { address: addressQuery, timestamp: timestampQuery } = req.query;
  const address = typeof addressQuery === "string" ? addressQuery : "";
  const timestamp = typeof timestampQuery === "string" ? Number(timestampQuery) : 0;

  if (isEmpty(address)) {
    return Err("'address' is not provided or empty");
  }

  return Ok({ address, timestamp });
}
