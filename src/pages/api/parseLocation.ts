import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import type { NextApiRequest, NextApiResponse } from "next";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getTimeZoneIdFromGoogleByLocation } from "@/utils/timezone";

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

const getAddressComponents = (placeDetails: google.maps.places.PlaceResult, fieldName: string) => {
  return placeDetails.address_components?.find((i) => i?.types?.includes(fieldName));
};

export const getLocationDetails = async (
  address: string,
  GOOGLE_MAPS_API_KEY: string,
  timestamp?: number
): Promise<ParseLocationResponse> => {
  if (isEmpty(address)) {
    return { error: "'address' is not provided or empty" };
  }

  const googleGeoCodeResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!googleGeoCodeResponse.ok) {
    return { error: `ParseLocation error: googleGeoCodeResponse is ${googleGeoCodeResponse.status}` };
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

  const result = {
    country: country,
    state: state,
    city: city,
    locationLatitude: locationLat.toFixed(6),
    locationLongitude: locationLng.toFixed(6),
    timeZoneId: timeZoneIdResult.ok ? timeZoneIdResult.value : UTC_TIME_ZONE_ID,
  };

  return result;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ParseLocationResponse>) {
  const GOOGLE_MAPS_API_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    console.error("ParseLocation error: GOOGLE_MAPS_API_KEY was not set");
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const { address: addressQuery, timestamp: timestampQuery } = req.query;
  const address = typeof addressQuery === "string" ? addressQuery : "";
  const timestamp = typeof timestampQuery === "string" ? Number(timestampQuery) : 0;

  if (isEmpty(address)) {
    res.status(500).json({ error: "'address' is not provided or empty" });
    return;
  }
  const locationDetails = await getLocationDetails(address, GOOGLE_MAPS_API_KEY, timestamp);

  if ("error" in locationDetails) {
    console.error(locationDetails.error);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  res.status(200).json(locationDetails);
  return;
}
