import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import type { NextApiRequest, NextApiResponse } from "next";
import { TimezoneResponse } from "./timezoneByLocation";
import { getTimeZoneIdFromGoogleByAddress } from "@/utils/timezone";

export type TimezoneByAddressRequest = {
  address: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<TimezoneResponse>) {
  const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    console.error("TimezoneByAddress error: GOOGLE_MAPS_API_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const parseQueryResult = parseQuery(req);
  if (!parseQueryResult.ok) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }

  const { address } = parseQueryResult.value;
  console.log(`\nCalling TimezoneByAddress API with params: 'address'=${address}`);

  const timeZoneIdResult = await getTimeZoneIdFromGoogleByAddress(address, GOOGLE_MAPS_API_KEY);

  if (!timeZoneIdResult.ok) {
    console.error(timeZoneIdResult.error);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  res.status(200).json({ timezone: timeZoneIdResult.value });
  return;
}

function parseQuery(req: NextApiRequest): Result<TimezoneByAddressRequest, string> {
  const { address: addressQuery } = req.query;
  const address = typeof addressQuery === "string" ? addressQuery : "";

  if (isEmpty(address)) {
    return Err("'address' is not provided or empty");
  }

  return Ok({ address });
}
