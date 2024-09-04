import { LocationInfo } from "@/model/LocationInfo";
import { ethers } from "ethers";
import moment from "moment";

export const DEFAULT_LOCAL_HOST_CHAIN_ID = 1337;
export const DEFAULT_GOOGLE_MAPS_SEARCH_ZOOM = 12;
export const DEFAULT_GOOGLE_MAPS_SEARCH_CENTER = {
  lat: 25.777747,
  lng: -80.216416,
};
export const GOOGLE_MAPS_MAP_ID = "70e109bf32920b0b";

export const ETH_DEFAULT_ADDRESS = ethers.getAddress("0x0000000000000000000000000000000000000000");

export const DEFAULT_AGREEMENT_MESSAGE =
  "I have read and I agree with Terms of service, Cancellation policy, Prohibited uses and Privacy policy of Rentality.";

export const DEFAULT_SEARCH_LOCATION: LocationInfo = {
  address: "Miami, Florida, US",
  country: "US",
  state: "Florida",
  city: "Miami",
  latitude: 25.782407,
  longitude: -80.229458,
  timeZoneId: "America/New_York",
};
export const DEFAULT_SEARCH_DATE_FROM = moment({ hour: 9 }).add(1, "day").toDate();
export const DEFAULT_SEARCH_DATE_TO = moment({ hour: 9 }).add(4, "day").toDate();
