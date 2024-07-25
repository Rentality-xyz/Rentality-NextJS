import { LocationInfo } from "@/model/LocationInfo";
import { ContractLocationInfo } from "@/model/blockchain/schemas";

export function formatLocationAddressFromLocationInfo(locationInfo: LocationInfo) {
  return formatLocationAddress(locationInfo.address, locationInfo.country, locationInfo.state, locationInfo.city);
}

export function formatLocationAddress(address: string, country: string, state: string, city: string) {
  console.debug(`formatLocationAddress input: ${address}`);

  const addressArray = address.split(",").map((i) => i.trim());

  if (addressArray.length === 0) return "";
  if (addressArray.length === 1) return country;
  if (addressArray.length === 2) return `${state}, ${country}`;

  const indexOfCity = addressArray.indexOf(city);
  const isFixibleAddress = indexOfCity === addressArray.length - 3 || indexOfCity === addressArray.length - 2;

  if (!isFixibleAddress) return `${city}, ${state}, ${country}`;

  addressArray[indexOfCity + 1] = state;
  addressArray[indexOfCity + 2] = country;

  console.log(`formatLocationAddress call. Input:${address} | Output: ${addressArray.join(", ")}`);
  return addressArray.join(", ");
}

export function mapLocationInfoToContractLocationInfo(locationInfo: LocationInfo): ContractLocationInfo {
  return {
    userAddress: formatLocationAddressFromLocationInfo(locationInfo),
    country: locationInfo.country,
    state: locationInfo.state,
    city: locationInfo.city,
    latitude: locationInfo.latitude.toFixed(6),
    longitude: locationInfo.longitude.toFixed(6),
    timeZoneId: locationInfo.timeZoneId,
  };
}
