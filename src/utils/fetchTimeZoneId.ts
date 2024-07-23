import { UTC_TIME_ZONE_ID } from "./date";

export const getTimeZoneIdFromAddress = async (latitude: number, longitude: number) => {
  if (longitude === 0) return UTC_TIME_ZONE_ID;

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("getTimeZoneIdFromAddress error: GOOGLE_MAPS_API_KEY was not set");
    return "";
  }

  var googleTimeZoneResponse = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=0&key=${GOOGLE_MAPS_API_KEY}`
  );
  if (!googleTimeZoneResponse.ok) {
    console.error(`getUtcOffsetMinutesFromLocation error: googleTimeZoneResponse is ${googleTimeZoneResponse.status}`);
    return UTC_TIME_ZONE_ID;
  }

  const googleTimeZoneJson = await googleTimeZoneResponse.json();

  return googleTimeZoneJson?.timeZoneId ?? UTC_TIME_ZONE_ID;
};
