import { isEmpty } from "./string";
import { AxiosResponse } from "axios";
import axios from "./cachedAxios";
import { TimezoneResponse } from "@/pages/api/timezoneByLocation";
import { formatLocationInfoUpToState, LocationInfo } from "@/model/LocationInfo";
import { Err, Ok, Result } from "@/model/utils/result";
import { UTC_TIME_ZONE_ID } from "./date";
import { getLocationInfoFromGoogleByAddress } from "./location";

// Client functions with cache
export async function getTimeZoneIdByLocation(latitude: number, longitude: number) {
  const response: AxiosResponse = await axios.get(
    `/api/timezoneByLocation?latitude=${latitude}&longitude=${longitude}`
  );

  if (response.status !== 200) {
    console.log("TimeZone Id was not fetched: " + response.status + " with data " + response.data);
    return "";
  }

  const data = response.data as TimezoneResponse;
  if ("error" in data) {
    console.log("TimeZone Id was not fetched: with error " + data.error);
    return "";
  }

  return data.timezone;
}

export async function getTimeZoneIdByAddress(locationInfo: Pick<LocationInfo, "country" | "state">) {
  const address = formatLocationInfoUpToState(locationInfo);
  if (isEmpty(address)) {
    console.log("TimeZone Id was not fetched: address is empty");
    return null;
  }

  const response: AxiosResponse = await axios.get(`/api/timezoneByAddress?address=${address}`);

  if (response.status !== 200) {
    console.log("TimeZone Id was not fetched: " + response.status + " with data " + response.data);
    return null;
  }
  const data = response.data as TimezoneResponse;
  if ("error" in data) {
    console.log("TimeZone Id was not fetched: with error " + data.error);
    return null;
  }
  return data.timezone;
}

// Server functions
export async function getTimeZoneIdFromGoogleByLocation(
  latitude: number,
  longitude: number,
  googleMapsApiKey: string
): Promise<Result<string, string>> {
  if (longitude === 0) return Ok(UTC_TIME_ZONE_ID);

  if (isEmpty(googleMapsApiKey)) {
    return Err("getTimeZoneIdFromLocation error: GOOGLE_MAPS_API_KEY is missed");
  }

  var googleTimeZoneResponse = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=0&key=${googleMapsApiKey}`
  );

  if (!googleTimeZoneResponse.ok) {
    console.error(`getTimeZoneIdFromLocation error: googleTimeZoneResponse is ${googleTimeZoneResponse.status}`);
    return Err(`getTimeZoneIdFromLocation error: googleTimeZoneResponse is ${googleTimeZoneResponse.status}`);
  }

  const googleTimeZoneJson = await googleTimeZoneResponse.json();

  if (!googleTimeZoneJson || !googleTimeZoneJson.timeZoneId) {
    return Err("getTimeZoneIdFromLocation error: googleTimeZoneJson.timeZoneId is missed");
  }

  return Ok(googleTimeZoneJson.timeZoneId as string);
}

export async function getTimeZoneIdFromGoogleByAddress(
  address: string,
  googleMapsApiKey: string
): Promise<Result<string, string>> {
  if (isEmpty(address)) {
    return Err("getTimeZoneIdFromAddress error: address is empty");
  }
  if (isEmpty(googleMapsApiKey)) {
    return Err("getTimeZoneIdFromAddress error: GOOGLE_MAPS_API_KEY is missed");
  }

  const locationInfoResult = await getLocationInfoFromGoogleByAddress(address, googleMapsApiKey);

  if (!locationInfoResult.ok) {
    console.error(`getTimeZoneIdFromAddress error: locationInfoResult error: ${locationInfoResult.error}`);
    return Err(`getTimeZoneIdFromAddress error: locationInfoResult error: ${locationInfoResult.error}`);
  }

  return getTimeZoneIdFromGoogleByLocation(
    locationInfoResult.value.latitude,
    locationInfoResult.value.longitude,
    googleMapsApiKey
  );
}
