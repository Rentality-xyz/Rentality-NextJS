import { HostCarInfo } from "@/model/HostCarInfo";
import { isUploadedCarImage, UploadedCarImage } from "@/model/FileToUpload";
import { isEmpty } from "@/utils/string";
import { getFileURIFromPinata, getMetaDataFromIpfs } from "@/features/filestore/pinata/utils";

export function getFileHashFromUrl(URI: string) {
  if (!URI || URI.length === 0) return "";
  return URI.split("/").pop() ?? "";
}

export function getFileURI(URI: string) {
  if (isEmpty(URI)) return "";
  const fileHash = getFileHashFromUrl(URI);
  if (isEmpty(fileHash)) return "";
  return getFileURIFromPinata(fileHash);
}

export function getFileURIs(pinataURI: string[]) {
  if (!pinataURI || pinataURI.length === 0) return [];
  return pinataURI.map((uri) => getFileURI(uri));
}

export async function getMetaData(tokenURI: string) {
    return getMetaDataFromIpfs(tokenURI);
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
