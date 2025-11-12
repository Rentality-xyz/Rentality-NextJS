import { HostCarInfo } from "@/model/HostCarInfo";
import { isEmpty } from "./string";
import { isUploadedCarImage, UploadedCarImage } from "@/model/FileToUpload";
import { logger } from "./logger";

export function getIpfsHashFromUrl(pinataURI: string) {
  if (!pinataURI || pinataURI.length === 0) return "";
  return pinataURI.split("/").pop() ?? "";
}

function getIpfsURIfromPinata(pinataURI: string) {
  const fileHash = getIpfsHashFromUrl(pinataURI);
  if (isEmpty(fileHash)) return "";
  return "https://ipfs.io/ipfs/" + fileHash;
}

export function getIpfsURIfromAkave(pinataURI: string) {
  const fileHash = getIpfsHashFromUrl(pinataURI);
  if (isEmpty(fileHash)) return "";
  return "https://o3-rc1.akave.xyz/rnt-test-public-bucket-3/" + fileHash;
}

export function getIpfsURI(pinataURI: string) {
  if (isEmpty(pinataURI)) return "";
  return getIpfsURIfromPinata(pinataURI);
}

export function getIpfsURIs(pinataURI: string[]) {
  if (!pinataURI || pinataURI.length === 0) return [];
  return pinataURI.map((uri) => getIpfsURIfromPinata(uri));
}

export function getPinataGatewayURIfromPinata(pinataURI: string) {
  if (isEmpty(pinataURI)) return "";
  const fileHash = pinataURI.split("/").pop();
  if (isEmpty(fileHash)) return "";
  return "https://ivory-specific-mink-961.mypinata.cloud/ipfs/" + fileHash;
}

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

export async function getMetaDataFromIpfs(tokenURI: string) {
  const ipfsHash = getIpfsHashFromUrl(tokenURI);
  if (!ipfsHash) {
    logger.error("Invalid tokenURI or no IPFS hash found:", tokenURI);
    return {};
  }

  if(tokenURI.match('akave'))
    return {}

  for (const gateway of IPFS_GATEWAYS) {

    const url = gateway + ipfsHash;
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        logger.warn(`Gateway ${gateway} returned status ${response.status}`);
        continue;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.warn(`Error fetching from ${gateway}: ${error}`);
      // continue to next gateway
    }
  }

  logger.error("All IPFS gateways failed for:", tokenURI);
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
  images,
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
  const imageUrls: UploadedCarImage[] = images.filter(isUploadedCarImage);
  imageUrls.sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return 0;
  });

  return {
    name,
    description,
    image: imageUrls[0]?.url ?? "",
    attributes,
    allImages: imageUrls.map((i) => i.url),
  };
}

export function parseMetaData(meta: any) {
  return {
    mainImage: (meta.image as string) ?? "",
    images: (meta.allImages as string[]) ?? [meta.image as string] ?? [],
    name: (meta.name as string) ?? "",
    description: (meta.description as string) ?? "",
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

export type CarMetadata = {
  mainImage: string;
  images: string[];
  name: string;
  description: string;
  vinNumber: string;
  licensePlate: string;
  licenseState: string;
  brand: string;
  model: string;
  yearOfProduction: string;
  bodyType: string;
  color: string;
  doorsNumber: string;
  seatsNumber: string;
  trunkSize: string;
  transmission: string;
  wheelDrive: string;
  tankVolumeInGal: string;
};
