import { ContractLocationInfo, ContractSignedLocationInfo } from "@/model/blockchain/schemas";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { signLocationInfo } from "@/utils/signLocationInfo";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getTimeZoneIdFromGoogleByLocation } from "@/utils/timezone";

export type SignLocationRequest = {
  address: string;
};

export type SignLocationResponse =
  | ContractSignedLocationInfo
  | {
      error: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignLocationResponse>) {
  const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    console.error("SignLocation error: GOOGLE_MAPS_API_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const SIGNER_PRIVATE_KEY = env.SIGNER_PRIVATE_KEY;
  if (isEmpty(SIGNER_PRIVATE_KEY)) {
    console.error("SignLocation error: SIGNER_PRIVATE_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const parseQueryResult = parseQuery(req);
  if (!parseQueryResult.ok) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }

  const { address, chainId, providerApiUrl } = parseQueryResult.value;
  console.log(`\nCalling signLocation API with params: 'address'=${address} | 'chainId'=${chainId}`);

  const locationInfoResult = await getContractLocationInfoByAddress(address, GOOGLE_MAPS_API_KEY);

  if (!locationInfoResult.ok) {
    console.error(locationInfoResult.error);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const provider = new JsonRpcProvider(providerApiUrl);
  const signer = new Wallet(SIGNER_PRIVATE_KEY, provider);
  const signature = await signLocationInfo(signer, locationInfoResult.value);

  res.status(200).json({ locationInfo: locationInfoResult.value, signature });
  return;
}

function parseQuery(req: NextApiRequest): Result<{ address: string; chainId: number; providerApiUrl: string }, string> {
  const { address: addressQuery, chainId: chainIdQuery } = req.query;
  const address = typeof addressQuery === "string" ? addressQuery : "";
  const chainId = typeof chainIdQuery === "string" ? Number(chainIdQuery) : 0;

  if (isEmpty(address)) {
    return Err("'address' is not provided or empty");
  }
  if (Number.isNaN(chainId) || chainId === 0) {
    return Err("'chainId' is not provided or is not a number");
  }

  let providerApiUrl = process.env[`PROVIDER_API_URL_${chainId}`];
  if (!providerApiUrl) {
    console.error(`API signLocation error: API URL for chain id ${chainId} was not set`);
    return Err(`Chain id ${chainId} is not supported`);
  }

  return Ok({ address, chainId, providerApiUrl });
}

function getAddressComponents(placeDetails: google.maps.places.PlaceResult, fieldName: string) {
  return placeDetails.address_components?.find((i) => i?.types?.includes(fieldName));
}

async function getContractLocationInfoByAddress(
  address: string,
  GOOGLE_MAPS_API_KEY: string
): Promise<Result<ContractLocationInfo, string>> {
  if (isEmpty(address)) {
    return Err("'address' is not provided or empty");
  }

  const googleGeoCodeResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!googleGeoCodeResponse.ok) {
    return Err(`SignLocation error: googleGeoCodeResponse is ${googleGeoCodeResponse.status}`);
  }
  const googleGeoCodeJson = await googleGeoCodeResponse.json();
  const placeDetails = googleGeoCodeJson.results[0] as google.maps.places.PlaceResult;

  const country = getAddressComponents(placeDetails, "country")?.short_name ?? "";
  const state = getAddressComponents(placeDetails, "administrative_area_level_1")?.long_name ?? "";
  const city =
    getAddressComponents(placeDetails, "locality")?.long_name ??
    "" ??
    getAddressComponents(placeDetails, "sublocality_level_1")?.long_name ??
    "";

  const placeLat = placeDetails?.geometry?.location?.lat ?? 0; //because lat returns as number and not as ()=>number
  const placeLng = placeDetails?.geometry?.location?.lng ?? 0; //because lat returns as number and not as ()=>number

  const locationLat = typeof placeLat === "number" ? placeLat : placeLat();
  const locationLng = typeof placeLng === "number" ? placeLng : placeLng();

  const timeZoneIdResult = await getTimeZoneIdFromGoogleByLocation(locationLat, locationLng, GOOGLE_MAPS_API_KEY);

  const result: ContractLocationInfo = {
    userAddress: address,
    country: country,
    state: state,
    city: city,
    latitude: locationLat.toFixed(6),
    longitude: locationLng.toFixed(6),
    timeZoneId: timeZoneIdResult.ok ? timeZoneIdResult.value : UTC_TIME_ZONE_ID,
  };

  return Ok(result);
}
