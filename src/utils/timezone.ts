import { UTC_TIME_ZONE_ID } from "./date";
import { env } from "./env";
import { isEmpty } from "./string";

export async function getTimeZoneIdFromAddress(address: string) {
  if (isEmpty(address)) return UTC_TIME_ZONE_ID;

  const GOOGLE_MAPS_API_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    console.error("getTimeZoneIdFromAddress error: GOOGLE_MAPS_API_KEY was not set");
    return UTC_TIME_ZONE_ID;
  }

  const googleGeoCodeResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!googleGeoCodeResponse.ok) {
    console.error(`getTimeZoneIdFromAddress error: googleGeoCodeResponse is ${googleGeoCodeResponse.status}`);
    return UTC_TIME_ZONE_ID;
  }

  const googleGeoCodeJson = await googleGeoCodeResponse.json();
  const locationLat = googleGeoCodeJson.results[0]?.geometry?.location?.lat ?? 0;
  const locationLng = googleGeoCodeJson.results[0]?.geometry?.location?.lng ?? 0;

  return getTimeZoneIdFromLocation(locationLat, locationLng);
}

export const getTimeZoneIdFromLocation = async (latitude: number, longitude: number) => {
  if (longitude === 0) return UTC_TIME_ZONE_ID;

  const GOOGLE_MAPS_API_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (isEmpty(GOOGLE_MAPS_API_KEY)) {
    console.error("getTimeZoneIdFromLocation error: GOOGLE_MAPS_API_KEY was not set");
    return UTC_TIME_ZONE_ID;
  }

  var googleTimeZoneResponse = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=0&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!googleTimeZoneResponse.ok) {
    console.error(`getTimeZoneIdFromLocation error: googleTimeZoneResponse is ${googleTimeZoneResponse.status}`);
    return UTC_TIME_ZONE_ID;
  }

  const googleTimeZoneJson = await googleTimeZoneResponse.json();

  return googleTimeZoneJson?.timeZoneId ?? UTC_TIME_ZONE_ID;
};
