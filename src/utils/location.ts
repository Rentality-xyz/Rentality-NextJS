import { PlaceDetails } from "@/components/common/rntPlaceAutocompleteInput";
import { LocationInfo } from "@/model/LocationInfo";
import { ContractLocationInfo, ContractSignedLocationInfo } from "@/model/blockchain/schemas";
import { fixedNumber } from "./numericFormatters";
import { Err, Ok, Result } from "@/model/utils/result";
import { SignLocationResponse } from "@/pages/api/signLocation";
import { getTimeZoneIdFromLocation } from "./timezone";

export function formatLocationAddressFromLocationInfo(locationInfo: LocationInfo) {
  return formatLocationAddress(locationInfo.address, locationInfo.country, locationInfo.state, locationInfo.city);
}

export function formatLocationAddress(address: string, country: string, state: string, city: string) {
  const addressArray = address.split(",").map((i) => i.trim());

  if (addressArray.length === 0) return "";
  if (addressArray.length === 1) return country;
  if (addressArray.length === 2) return `${state}, ${country}`;

  const indexOfCity = addressArray.indexOf(city);
  const isFixibleAddress = indexOfCity === addressArray.length - 3 || indexOfCity === addressArray.length - 2;

  if (!isFixibleAddress) return `${city}, ${state}, ${country}`;

  addressArray[indexOfCity + 1] = state;
  addressArray[indexOfCity + 2] = country;

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

export function mapContractLocationInfoToLocationInfo(locationInfo: ContractLocationInfo): LocationInfo {
  return {
    address: locationInfo.userAddress,
    country: locationInfo.country,
    state: locationInfo.state,
    city: locationInfo.city,
    latitude: Number(locationInfo.latitude),
    longitude: Number(locationInfo.longitude),
    timeZoneId: locationInfo.timeZoneId,
  };
}

export function placeDetailsToLocationInfo(placeDetails: PlaceDetails): LocationInfo {
  return {
    address: placeDetails.addressString,
    country: placeDetails.country?.short_name ?? "",
    state: placeDetails.state?.long_name ?? "",
    city: placeDetails.city?.long_name ?? "",
    latitude: fixedNumber(placeDetails.location?.latitude ?? 0, 6),
    longitude: fixedNumber(placeDetails.location?.longitude ?? 0, 6),
    timeZoneId: "",
  };
}

export async function placeDetailsToLocationInfoWithTimeZone(placeDetails: PlaceDetails): Promise<LocationInfo> {
  const latitude = fixedNumber(placeDetails.location?.latitude ?? 0, 6);
  const longitude = fixedNumber(placeDetails.location?.longitude ?? 0, 6);
  return {
    address: placeDetails.addressString,
    country: placeDetails.country?.short_name ?? "",
    state: placeDetails.state?.long_name ?? "",
    city: placeDetails.city?.long_name ?? "",
    latitude: latitude,
    longitude: longitude,
    timeZoneId: await getTimeZoneIdFromLocation(latitude, longitude),
  };
}

export async function getSignedLocationInfo(
  locationInfo: LocationInfo | ContractLocationInfo,
  chainId: number
): Promise<Result<ContractSignedLocationInfo, string>> {
  const address = "address" in locationInfo ? locationInfo.address : locationInfo.userAddress;

  var url = new URL(`/api/signLocation`, window.location.origin);
  url.searchParams.append("address", address);
  url.searchParams.append("chainId", chainId.toString());
  const apiResponse = await fetch(url);

  if (!apiResponse.ok) {
    return Err("Sign location error");
  }
  const apiJson = (await apiResponse.json()) as SignLocationResponse;
  if ("error" in apiJson) {
    return Err("Sign location error");
  }
  console.log(`LocationInfo: ${JSON.stringify(apiJson, null, 2)}`);
  return Ok(apiJson);
}
