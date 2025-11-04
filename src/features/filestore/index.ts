import { Err, Ok, Result } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { isEmpty } from "@/utils/string";
import { HostCarInfo } from "@/model/HostCarInfo";
import { PlatformCarImage, UploadedCarImage } from "@/model/FileToUpload";
import {
  deleteFileFromIPFS, getFileURIFromPinata, getMetaDataFromIpfs,
  getTripCarPhotosFromIPFS,
  uploadFileToIPFS,
  uploadJSONToIPFS,
} from "@/features/filestore/pinata";
import { getFileHashFromUrl, getNftJSONFromCarInfo } from "@/features/filestore/utils";
import {
  deleteFileFromAkave, getFileURIFromAkave, getMetaDataFromAkave,
  getTripCarPhotosFromAkave,
  uploadFileToAkave,
  uploadJSONToAkave,
} from "@/features/filestore/akave";
import { env } from "@/utils/env";

export type UploadedUrl = { url: string };
export type UploadedUrlList = { urls: string[] };

export async function saveUserProfilePhoto(
  file: File,
  chainId: number,
  keyValues?: {}
): Promise<Result<UploadedUrl>> {
  const timestamp = Date.now();
  const fileName = `${chainId}_RentalityProfileImage_${timestamp}`;
  return uploadFile(file, fileName, { ...keyValues, chainId });
}


export async function saveFilesForClaim(
  files: File[],
  chainId: number,
  tripId: number,
  keyValues?: {}
): Promise<Result<UploadedUrlList>> {
  const savedUrls: string[] = [];
  for (const file of files.filter((i) => i)) {
    const timestamp = Date.now();
    const fileName = `${chainId}_RentalityClaimFile_${tripId}_${timestamp}`;
    const uploadResult = await uploadFile(file, fileName, { ...keyValues, chainId: chainId });

    if (!uploadResult.ok) {
      if (savedUrls.length > 0) {
        logger.info("Reverting uploaded files...");
        for (const savedUrl of savedUrls) {
          await deleteFile(savedUrl);
        }
      }
      return uploadResult;
    }

    savedUrls.push(uploadResult.value.url);
  }

  return Ok({ urls: savedUrls });
}

export async function saveGeneralInsurancePhoto(
  file: File,
  chainId: number,
  keyValues?: {}
): Promise<Result<UploadedUrl>> {
  const timestamp = Date.now();
  const fileName = `${chainId}_RentalityGuestInsurance_${timestamp}`;
  return uploadFile(file, fileName, { ...keyValues, chainId: chainId });
}

type SaveCarMetadataResult = {
  metadataUrl: string;
  newUploadedUrls: string[];
  urlsToDelete: string[];
};

export async function saveCarMetadata(
  files: PlatformCarImage[],
  chainId: number,
  carInfo: HostCarInfo,
  keyValues?: {}
): Promise<Result<SaveCarMetadataResult>> {
  let metadataUrl = "";
  let newUploadedUrls: string[] = [];
  let urlsToDelete: string[] = [];
  let carImagesToSaveInMetadata: UploadedCarImage[] = [];

  for (const file of files.filter((i) => i)) {
    if ("url" in file) {
      if (file.isDeleted) {
        urlsToDelete.push(file.url);
      } else {
        carImagesToSaveInMetadata.push(file);
      }
      continue;
    }
    const timestamp = Date.now();
    const fileName = `${chainId}_RentalityCarImage_${timestamp}`;
    const uploadImageResult = await uploadFile(file.file, fileName, { ...keyValues, chainId: chainId });

    if (!uploadImageResult.ok) {
      if (newUploadedUrls.length > 0) {
        logger.info("Reverting uploaded files...");
        for (const savedUrl of newUploadedUrls) {
          await deleteFile(savedUrl);
        }
      }
      return uploadImageResult;
    }

    newUploadedUrls.push(uploadImageResult.value.url);
    carImagesToSaveInMetadata.push({ url: uploadImageResult.value.url, isPrimary: file.isPrimary });
  }
  const timestamp = Date.now();
  const nftJSON = getNftJSONFromCarInfo({ ...carInfo, images: carImagesToSaveInMetadata });
  const metadataFileName = `${chainId}_RentalityNFTMetadata_${timestamp}`;
  const uploadMetadataResult = await uploadJSON(nftJSON, metadataFileName, { ...keyValues, chainId: chainId });

  if (!uploadMetadataResult.ok) {
    if (newUploadedUrls.length > 0) {
      logger.info("Reverting uploaded files...");
      for (const savedUrl of newUploadedUrls) {
        await deleteFile(savedUrl);
      }
    }
    return uploadMetadataResult;
  } else {
    metadataUrl = uploadMetadataResult.value.url;
    newUploadedUrls.push(metadataUrl);
  }

  return Ok({ metadataUrl, newUploadedUrls, urlsToDelete });
}

export interface GetPhotosForTripResponseType {
  checkInByHost: string[];
  checkInByGuest: string[];
  checkOutByGuest: string[];
  checkOutByHost: string[];
}

export async function saveTripCarPhotos(
  files: File[],
  chainId: number,
  tripId: number,
  uploadedBy: "host" | "guest",
  tripStatus: "start" | "finish",
  keyValues?: {}
): Promise<Result<UploadedUrlList>> {
  const savedUrls: string[] = [];

  for (const file of files.filter((i) => i)) {
    const timestamp = Date.now();
    const fileName = `${chainId}_${uploadedBy}-${tripStatus}-Trip-${tripId}-Photo-${timestamp}`;
    const uploadResult = await uploadFile(file, fileName, {
      ...keyValues,
      tripId: tripId,
      chainId: chainId,
      uploadedBy: uploadedBy,
      tripStatus: tripStatus,
    });

    if (!uploadResult.ok) {
      if (savedUrls.length > 0) {
        logger.info("Reverting uploaded files...");
        for (const savedUrl of savedUrls) {
          await deleteFile(savedUrl);
        }
      }
      return uploadResult;
    }

    savedUrls.push(uploadResult.value.url);
  }

  return Ok({ urls: savedUrls });
}

export async function saveAiAssessment(JSONBody: {}, chainId: number, keyValues?: {}): Promise<Result<UploadedUrl>> {
  const timestamp = Date.now();
  const fileName = `${chainId}_RentalityAiAssessment_${timestamp}`;
  return uploadJSON(JSONBody, fileName, { ...keyValues, chainId: chainId });
}

export async function deleteFileByUrl(fileUrl: string): Promise<Result<boolean>> {
  const fileUrlHash = getFileHashFromUrl(fileUrl);

  if (isEmpty(fileUrlHash)) {
    return Err(new Error(`fileUrl ${fileUrl} does not contain hash`));
  }
  return deleteFile(fileUrlHash);
}

export async function deleteFilesByUrl(fileUrls: string[]): Promise<Result<boolean, Error[]>> {
  const errors: Error[] = [];

  for (const fileUrl in fileUrls) {
    const deleteResult = await deleteFileByUrl(fileUrl);

    if (!deleteResult.ok) {
      errors.push(deleteResult.error);
    }
  }
  return errors.length === 0 ? Ok(true) : Err(errors);
}


export function getFileURIs(uri: string[]) {
  if (!uri || uri.length === 0) return [];
  return uri.map((curUri) => getFileURI(curUri));
}

export function getFileURI(URI: string) {
  if (isEmpty(URI)) return "";
  const fileHash = getFileHashFromUrl(URI);
  if (isEmpty(fileHash)) return "";


  if (URI.includes("akave")) {
    return getFileURIFromAkave(fileHash);
  }
  return getFileURIFromPinata(fileHash);

}

export async function getMetaData(tokenURI: string) {
  if (isEmpty(tokenURI)) return "";
  const fileHash = getFileHashFromUrl(tokenURI);
  if (isEmpty(fileHash)) return "";

  if (tokenURI.includes("akave")) {
    return getMetaDataFromAkave(fileHash);
  }
  return getMetaDataFromIpfs(fileHash);
}

export async function getTripCarPhotos(tripId: number): Promise<GetPhotosForTripResponseType> {
  switch (env.NEXT_PUBLIC_FILESTORE_NAME.toLowerCase()) {
    case "akave": return await getTripCarPhotosFromAkave(tripId);
    default: return await getTripCarPhotosFromIPFS(tripId);
  }
}

async function uploadFile(file: File, fileName: string, keyValues?: {}): Promise<Result<UploadedUrl>> {
  switch (env.NEXT_PUBLIC_FILESTORE_NAME.toLowerCase()) {
    case "akave": return await uploadFileToAkave(file, fileName, keyValues);
    default: return await uploadFileToIPFS(file, fileName, keyValues);
  }
}

async function deleteFile(hash: string): Promise<Result<boolean>> {
  switch (env.NEXT_PUBLIC_FILESTORE_NAME.toLowerCase()) {
    case "akave": return await deleteFileFromAkave(hash);
    default: return await deleteFileFromIPFS(hash);
  }
}

async function uploadJSON(JSONBody: {}, fileName: string, keyValues?: {}): Promise<Result<UploadedUrl>> {
  switch (env.NEXT_PUBLIC_FILESTORE_NAME.toLowerCase()) {
    case "akave": return await uploadJSONToAkave(JSONBody, fileName, keyValues);
    default: return await uploadJSONToIPFS(JSONBody, fileName, keyValues);
  }
}

