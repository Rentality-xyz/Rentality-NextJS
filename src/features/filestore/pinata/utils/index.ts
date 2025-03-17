import FormData from "form-data";
import axios from "axios";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { isEmpty } from "@/utils/string";
import { getIpfsHashFromUrl } from "@/utils/ipfsUtils";

const pinataJwt = env.NEXT_PUBLIC_PINATA_JWT;
const PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const UNPIN_FILE_URL = "https://api.pinata.cloud/pinning/unpin/{id}";

export async function saveUserProfilePhoto(
  file: File,
  chainId: number,
  keyValues?: {}
): Promise<Result<{ url: string }>> {
  const fileName = `${chainId}_RentalityProfileImage`;
  return uploadFileToIPFS(file, fileName, keyValues);
}

export async function deleteUserProfilePhoto(profileImageUrl: string): Promise<Result<boolean>> {
  const profileImageUrlHash = getIpfsHashFromUrl(profileImageUrl);

  if (isEmpty(profileImageUrlHash)) {
    return Err(new Error("profileImageUrl does not contain hash"));
  }
  return deleteFileFromIPFS(profileImageUrlHash);
}

export async function saveFilesForClaim(
  files: File[],
  chainId: number,
  tripId: number,
  keyValues?: {}
): Promise<Result<{ urls: string[] }>> {
  const savedUrls: string[] = [];

  for (const file of files.filter((i) => i)) {
    const fileName = `${chainId}_RentalityClaimFile_${tripId}`;
    const uploadResult = await uploadFileToIPFS(file, fileName, keyValues);

    if (!uploadResult.ok) {
      if (savedUrls.length > 0) {
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

function getMatadata(fileName: string, keyValues?: {}) {
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

async function uploadFileToIPFS(file: File, fileName: string, keyValues?: {}): Promise<Result<{ url: string }>> {
  let data = new FormData();
  data.append("file", file);
  data.append("pinataMetadata", getMatadata(fileName, keyValues));
  data.append("pinataOptions", getPinataOptions());

  return axios
    .post(PIN_FILE_URL, data, {
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=undefined}`,
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then((response) => {
      console.log("File uploaded successfully: ", response.data.IpfsHash);
      return Ok({
        url: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
      });
    })
    .catch((error) => {
      console.error(error);
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
