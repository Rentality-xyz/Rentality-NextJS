import { isEmpty } from "@/utils/string";

export type LocationInfo = {
  address: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
};

export const emptyLocationInfo: LocationInfo = {
  address: "",
  country: "",
  state: "",
  city: "",
  latitude: 0,
  longitude: 0,
  timeZoneId: "",
};

export function formatLocationInfoUpToCity(locationInfo: Pick<LocationInfo, "country" | "state" | "city">) {
  const locationResult = [];

  if (!isEmpty(locationInfo.city)) locationResult.push(locationInfo.city);
  if (!isEmpty(locationInfo.state)) locationResult.push(locationInfo.state);
  if (!isEmpty(locationInfo.country)) locationResult.push(locationInfo.country);
  return locationResult.join(", ");
}

export function formatLocationInfoUpToState(locationInfo: Pick<LocationInfo, "country" | "state">) {
  const locationResult = [];

  if (!isEmpty(locationInfo.state)) locationResult.push(locationInfo.state);
  if (!isEmpty(locationInfo.country)) locationResult.push(locationInfo.country);
  return locationResult.join(", ");
}
