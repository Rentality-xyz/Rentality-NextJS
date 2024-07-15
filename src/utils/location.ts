import { LocationInfo } from "@/model/LocationInfo";
import { ContractLocationInfo } from "@/model/blockchain/schemas";

export function formatLocationAddressFromLocationInfo(locationInfo: LocationInfo) {
  return formatLocationAddress(locationInfo.address, locationInfo.country, locationInfo.state, locationInfo.city);
}

export function formatLocationAddress(address: string, country: string, state: string, city: string) {
  console.debug(`formatLocationAddress input: ${address}`);

  const addressArray = address.split(",").map((i) => i.trim());

  if (addressArray.length >= 1) {
    addressArray[addressArray.length - 1] = country;
  }
  if (addressArray.length >= 2) {
    addressArray[addressArray.length - 2] = state;
  }
  if (addressArray.length >= 3) {
    addressArray[addressArray.length - 3] = city;
  }

  console.debug(`formatLocationAddress output: ${addressArray.join(", ")}`);
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
