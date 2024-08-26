import { ContractLocationInfo } from "./blockchain/schemas";

export type LocationInfo = {
  address: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
};

export const emptyLocationInfo = {
  address: "",
  country: "",
  state: "",
  city: "",
  latitude: 0,
  longitude: 0,
  timeZoneId: "",
};

export function formatLocationInfoUpToCity(locationInfo: LocationInfo | ContractLocationInfo) {
  const city = locationInfo.city != null && locationInfo.city.length > 0 ? locationInfo.city + ", " : "";
  const state = locationInfo.state != null && locationInfo.state.length > 0 ? locationInfo.state + ", " : "";
  const country = locationInfo.country != null && locationInfo.country.length > 0 ? locationInfo.country + ", " : "";

  const location = `${city}${state}${country}`;
  if (location.length > 2) {
    return location.slice(0, -2);
  }

  return location;
}
