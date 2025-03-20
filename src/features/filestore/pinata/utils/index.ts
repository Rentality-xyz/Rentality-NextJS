import FormData from "form-data";
import axios from "axios";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { isEmpty } from "@/utils/string";
import { getIpfsHashFromUrl, getNftJSONFromCarInfo } from "@/utils/ipfsUtils";
import { HostCarInfo } from "@/model/HostCarInfo";
import { PlatformCarImage, UploadedCarImage } from "@/model/FileToUpload";

const pinataJwt = env.NEXT_PUBLIC_PINATA_JWT;
const PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const UNPIN_FILE_URL = "https://api.pinata.cloud/pinning/unpin/{id}";
const GET_TRIP_FILE_LIST_URL = `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"tripId":{"value":"{tripId}","op":"eq"}}`;

export type UploadedUrl = { url: string };
export type UploadedUrlList = { urls: string[] };

export async function saveUserProfilePhoto(file: File, chainId: number, keyValues?: {}): Promise<Result<UploadedUrl>> {
  const fileName = `${chainId}_RentalityProfileImage`;
  return uploadFileToIPFS(file, fileName, { ...keyValues, chainId: chainId });
}

export async function saveFilesForClaim(
  files: File[],
  chainId: number,
  tripId: number,
  keyValues?: {}
): Promise<Result<UploadedUrlList>> {
  const savedUrls: string[] = [];

  for (const file of files.filter((i) => i)) {
    const fileName = `${chainId}_RentalityClaimFile_${tripId}`;
    const uploadResult = await uploadFileToIPFS(file, fileName, { ...keyValues, chainId: chainId });

    if (!uploadResult.ok) {
      if (savedUrls.length > 0) {
        logger.info("Reverting uploaded files...");
        for (const savedUrl of savedUrls) {
          await deleteFileFromIPFS(savedUrl);
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
  const fileName = `${chainId}_RentalityGuestInsurance`;
  return uploadFileToIPFS(file, fileName, { ...keyValues, chainId: chainId });
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

    const fileName = `${chainId}_RentalityCarImage`;
    const uploadImageResult = await uploadFileToIPFS(file.file, fileName, { ...keyValues, chainId: chainId });

    if (!uploadImageResult.ok) {
      if (newUploadedUrls.length > 0) {
        logger.info("Reverting uploaded files...");
        for (const savedUrl of newUploadedUrls) {
          await deleteFileFromIPFS(savedUrl);
        }
      }
      return uploadImageResult;
    }

    newUploadedUrls.push(uploadImageResult.value.url);
    carImagesToSaveInMetadata.push({ url: uploadImageResult.value.url, isPrimary: file.isPrimary });
  }

  const nftJSON = getNftJSONFromCarInfo({ ...carInfo, images: carImagesToSaveInMetadata });
  const metadataFileName = `${chainId}_RentalityNFTMetadata`;
  const uploadMetadataResult = await uploadJSONToIPFS(nftJSON, metadataFileName, { ...keyValues, chainId: chainId });

  if (!uploadMetadataResult.ok) {
    if (newUploadedUrls.length > 0) {
      logger.info("Reverting uploaded files...");
      for (const savedUrl of newUploadedUrls) {
        await deleteFileFromIPFS(savedUrl);
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
  checkinByHost: string[];
  checkOutByHost: string[];
  checkInByGuest: string[];
  checkOutByGuest: string[];
}

export async function getTripCarPhotos(tripId: number): Promise<GetPhotosForTripResponseType> {
  const url = GET_TRIP_FILE_LIST_URL.replace("{tripId}", tripId.toString());

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
  });

  if (response.data.rows === undefined) {
    throw new Error("Incorrect response format getting photos for the trip");
  }

  const returnValue: GetPhotosForTripResponseType = {
    checkinByHost: [],
    checkOutByHost: [],
    checkInByGuest: [],
    checkOutByGuest: [],
  };

  for (let i: number = 0; i < response.data.rows.length; i++) {
    const row = response.data.rows[i];
    const isHost: boolean = row.metadata.keyvalues.isHost === "host";
    const isStart: boolean = row.metadata.keyvalues.isStart === "start";
    const urlToFile = `https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`;

    if (isHost) {
      if (isStart) {
        returnValue.checkinByHost.push(urlToFile);
      } else {
        returnValue.checkOutByHost.push(urlToFile);
      }
    } else {
      if (isStart) {
        returnValue.checkInByGuest.push(urlToFile);
      } else {
        returnValue.checkOutByGuest.push(urlToFile);
      }
    }
  }

  return returnValue;
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
    const fileName = `${chainId}_${uploadedBy}-${tripStatus}-Trip-${tripId}-Photo`;
    const uploadResult = await uploadFileToIPFS(file, fileName, {
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
          await deleteFileFromIPFS(savedUrl);
        }
      }
      return uploadResult;
    }

    savedUrls.push(uploadResult.value.url);
  }

  return Ok({ urls: savedUrls });
}

export async function saveAiAssessment(JSONBody: {}, chainId: number, keyValues?: {}): Promise<Result<UploadedUrl>> {
  const fileName = `${chainId}_RentalityAiAssessment`;
  return uploadJSONToIPFS(JSONBody, fileName, { ...keyValues, chainId: chainId });
}

export async function deleteFileByUrl(fileUrl: string): Promise<Result<boolean>> {
  const fileUrlHash = getIpfsHashFromUrl(fileUrl);

  if (isEmpty(fileUrlHash)) {
    return Err(new Error(`fileUrl ${fileUrl} does not contain hash`));
  }
  return deleteFileFromIPFS(fileUrlHash);
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

function getMetadata(fileName: string, keyValues?: {}) {
  return JSON.stringify({
    name: fileName,
    keyvalues: keyValues,
  });
}

function getPinataOptions() {
  return JSON.stringify({
    cidVersion: 0,
    customPinPolicy: {
      regions: [
        {
          id: "FRA1",
          desiredReplicationCount: 1,
        },
        {
          id: "NYC1",
          desiredReplicationCount: 2,
        },
      ],
    },
  });
}

async function uploadFileToIPFS(file: File, fileName: string, keyValues?: {}): Promise<Result<UploadedUrl>> {
  let data = new FormData();
  data.append("file", file);
  data.append("pinataMetadata", getMetadata(fileName, keyValues));
  data.append("pinataOptions", getPinataOptions());

  return axios
    .post(PIN_FILE_URL, data, {
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=undefined`,
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then((response) => {
      logger.debug("File uploaded successfully: ", response.data.IpfsHash);
      return Ok({
        url: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
      });
    })
    .catch((error) => {
      logger.error(error);
      return error instanceof Error ? Err(error) : Err(new Error(error.toString()));
    });
}

async function deleteFileFromIPFS(ipfsHash: string): Promise<Result<boolean>> {
  const url = UNPIN_FILE_URL.replace("{id}", ipfsHash);

  return axios
    .delete(url, {
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then((response) => {
      logger.debug(`file ${response.data.IpfsHash} unpinned from pinata`);
      return Ok(true);
    })
    .catch((error) => {
      logger.error(error);
      return error instanceof Error ? Err(error) : Err(new Error(error.toString()));
    });
}

async function uploadJSONToIPFS(JSONBody: {}, fileName: string, keyValues?: {}): Promise<Result<UploadedUrl>> {
  const pinataData = {
    pinataContent: JSONBody,
    pinataOptions: { cidVersion: 0 },
    pinataMetadata: { name: fileName, keyvalues: keyValues },
  };

  return axios
    .post(PIN_JSON_URL, pinataData, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then(function (response) {
      logger.debug("JSON uploaded successfully: ", response.data.IpfsHash);
      return Ok({
        url: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
      });
    })
    .catch((error) => {
      logger.error(error);
      return error instanceof Error ? Err(error) : Err(new Error(error.toString()));
    });
}
