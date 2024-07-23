import { HostCarInfo } from "@/model/HostCarInfo";
import { isEmpty } from "./string";

export function getIpfsURIfromPinata(pinataURI: string) {
  if (isEmpty(pinataURI)) return "";
  const fileHash = pinataURI.split("/").pop();
  if (isEmpty(fileHash)) return "";
  return "https://ipfs.io/ipfs/" + fileHash;
}

export function getPinataGatewayURIfromPinata(pinataURI: string) {
  if (isEmpty(pinataURI)) return "";
  const fileHash = pinataURI.split("/").pop();
  if (isEmpty(fileHash)) return "";
  return "https://ivory-specific-mink-961.mypinata.cloud/ipfs/" + fileHash;
}

export async function getMetaDataFromIpfs(tokenURI: string) {
  //var ipfsURI = getPinataGatewayURIfromPinata(tokenURI);
  var ipfsURI = getIpfsURIfromPinata(tokenURI);
  if (!ipfsURI) return "";

  try {
    const response = await fetch(ipfsURI, {
      headers: {
        Accept: "application/json",
      },
    });
    return await response.json();
  } catch (ex) {
    console.error("load metadata from pinata gateway error:", ex);

    ipfsURI = getIpfsURIfromPinata(tokenURI);
    try {
      console.log("try fetch " + ipfsURI);

      const response = await fetch(ipfsURI, {
        headers: {
          Accept: "application/json",
        },
      });
      return await response.json();
    } catch (ex) {
      console.error("load metadata from IPFS error:", ex);
    }
  }
  return {};
}

const META_KEY_VIN_NUMBER = "VIN number";
const META_KEY_LICENSE_PLATE = "License plate";
const META_KEY_LICENSE_STATE = "License state";
const META_KEY_BRAND = "Brand";
const META_KEY_MODEL = "Model";
const META_KEY_RELEASE_YEAR = "Release year";
const META_KEY_BODY_TYPE = "Body type";
const META_KEY_COLOR = "Color";
const META_KEY_DOORS_NUMBER = "Doors number";
const META_KEY_SEATS_NUMBER = "Seats number";
const META_KEY_TRUNK_SIZE = "Trunk size";
const META_KEY_TRANSMISSION = "Transmission";
const META_KEY_WHEEL_DRIVE = "Wheel drive";
const META_KEY_TANK_VOLUME_GAL = "Tank volume(gal)";

export function getNftJSONFromCarInfo({
  vinNumber,
  brand,
  model,
  releaseYear,
  image,
  name,
  licensePlate,
  licenseState,
  seatsNumber,
  doorsNumber,
  tankVolumeInGal,
  wheelDrive,
  transmission,
  trunkSize,
  color,
  bodyType,
  description,
}: HostCarInfo) {
  const attributes = [
    {
      trait_type: META_KEY_VIN_NUMBER,
      value: vinNumber,
    },
    {
      trait_type: META_KEY_LICENSE_PLATE,
      value: licensePlate,
    },
    {
      trait_type: META_KEY_LICENSE_STATE,
      value: licenseState,
    },
    {
      trait_type: META_KEY_BRAND,
      value: brand,
    },
    {
      trait_type: META_KEY_MODEL,
      value: model,
    },
    {
      trait_type: META_KEY_RELEASE_YEAR,
      value: releaseYear.toString(),
    },
    {
      trait_type: META_KEY_BODY_TYPE,
      value: bodyType,
    },
    {
      trait_type: META_KEY_COLOR,
      value: color,
    },
    {
      trait_type: META_KEY_DOORS_NUMBER,
      value: doorsNumber.toString(),
    },
    {
      trait_type: META_KEY_SEATS_NUMBER,
      value: seatsNumber.toString(),
    },
    {
      trait_type: META_KEY_TRUNK_SIZE,
      value: trunkSize,
    },
    {
      trait_type: META_KEY_TRANSMISSION,
      value: transmission,
    },
    {
      trait_type: META_KEY_WHEEL_DRIVE,
      value: wheelDrive,
    },
    {
      trait_type: META_KEY_TANK_VOLUME_GAL,
      value: tankVolumeInGal.toString(),
    },
  ];
  return {
    name,
    description,
    image,
    attributes,
  };
}

export function parseMetaData(meta: any) {
  return {
    image: meta.image ?? "",
    name: meta.name ?? "",
    description: meta.description ?? "",
    vinNumber: meta.attributes?.find((x: any) => x.trait_type === META_KEY_VIN_NUMBER)?.value ?? "",
    licensePlate: meta.attributes?.find((x: any) => x.trait_type === META_KEY_LICENSE_PLATE)?.value ?? "",
    licenseState: meta.attributes?.find((x: any) => x.trait_type === META_KEY_LICENSE_STATE)?.value ?? "",
    brand: meta.attributes?.find((x: any) => x.trait_type === META_KEY_BRAND)?.value ?? "",
    model: meta.attributes?.find((x: any) => x.trait_type === META_KEY_MODEL)?.value ?? "",
    yearOfProduction: meta.attributes?.find((x: any) => x.trait_type === META_KEY_RELEASE_YEAR)?.value ?? "0",
    bodyType: meta.attributes?.find((x: any) => x.trait_type === META_KEY_BODY_TYPE)?.value ?? "",
    color: meta.attributes?.find((x: any) => x.trait_type === META_KEY_COLOR)?.value ?? "",
    doorsNumber: meta.attributes?.find((x: any) => x.trait_type === META_KEY_DOORS_NUMBER)?.value ?? "0",
    seatsNumber: meta.attributes?.find((x: any) => x.trait_type === META_KEY_SEATS_NUMBER)?.value ?? "0",
    trunkSize: meta.attributes?.find((x: any) => x.trait_type === META_KEY_TRUNK_SIZE)?.value ?? "0",
    transmission: meta.attributes?.find((x: any) => x.trait_type === META_KEY_TRANSMISSION)?.value ?? "",
    wheelDrive: meta.attributes?.find((x: any) => x.trait_type === META_KEY_WHEEL_DRIVE)?.value ?? "",
    tankVolumeInGal: meta.attributes?.find((x: any) => x.trait_type === META_KEY_TANK_VOLUME_GAL)?.value ?? "0",
  };
}
