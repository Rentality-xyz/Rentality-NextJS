import { ethers } from "ethers";

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