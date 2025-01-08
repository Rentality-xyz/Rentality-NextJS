import { UAParser } from "ua-parser-js";

export function getDevicePlatform(): DevicePlatform {
  const parser = new UAParser();
  const osName = parser.getOS().name ?? DevicePlatform.Unknown;

  switch (osName) {
    case "Android":
      return DevicePlatform.Android;
    case "iOS":
      return DevicePlatform.iOS;
    case "Windows":
      return DevicePlatform.Windows;
    case "Mac OS":
      return DevicePlatform.Mac;
    default:
      return DevicePlatform.Unknown;
  }
}

export enum DevicePlatform {
  Android = "Android",
  iOS = "iOS",
  Windows = "Windows",
  Mac = "Mac",
  Unknown = "Unknown",
}

export function isMobileAppRentality(): Boolean {
  return navigator.userAgent.includes("RentalityApp");
}
