import FormData from "form-data";
import axios from "axios";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { GetPhotosForTripResponseType } from "@/features/filestore";

const pinataJwt = env.NEXT_PUBLIC_PINATA_JWT;
const PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const UNPIN_FILE_URL = "https://api.pinata.cloud/pinning/unpin/{id}";
const GET_TRIP_FILE_LIST_URL = `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"tripId":{"value":"{tripId}","op":"eq"}}`;

export type UploadedUrl = { url: string };

export async function getTripCarPhotosFromIPFS(tripId: number): Promise<GetPhotosForTripResponseType> {
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
    checkInByHost: [],
    checkInByGuest: [],
    checkOutByGuest: [],
    checkOutByHost: [],
  };

  for (let i: number = 0; i < response.data.rows.length; i++) {
    const row = response.data.rows[i];
    const isHost: boolean = row.metadata.keyvalues.uploadedBy === "host";
    const isStart: boolean = row.metadata.keyvalues.tripStatus === "start";
    const urlToFile = `https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`;

    if (isHost) {
      if (isStart) {
        returnValue.checkInByHost.push(urlToFile);
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

export async function uploadFileToIPFS(file: File, fileName: string, keyValues?: {}): Promise<Result<UploadedUrl>> {
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

export async function deleteFileFromIPFS(ipfsHash: string): Promise<Result<boolean>> {
  const url = UNPIN_FILE_URL.replace("{id}", ipfsHash);

  return axios
    .delete(url, {
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then((response) => {
      logger.debug(`file ${ipfsHash} unpinned from pinata`);
      return Ok(true);
    })
    .catch((error) => {
      logger.error(error);
      return error instanceof Error ? Err(error) : Err(new Error(error.toString()));
    });
}

export async function uploadJSONToIPFS(JSONBody: {}, fileName: string, keyValues?: {}): Promise<Result<UploadedUrl>> {
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

export function getFileURIFromPinata(fileHash: string) {
  return "https://ipfs.io/ipfs/" + fileHash;
}

const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
];

export async function getMetaDataFromIpfs(ipfsHash: string) {

  for (const gateway of IPFS_GATEWAYS) {
    const url = gateway + ipfsHash;
    try {
      logger.info(`Fetching metadata from ${url}`);
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        logger.warn(`Gateway ${gateway} returned status ${response.status}`);
        continue;
      }

      return await response.json();
    } catch (error) {
      logger.warn(`Error fetching from ${gateway}: ${error}`);
      // continue to next gateway
    }
  }

  logger.error("All IPFS gateways failed for:", ipfsHash);
  return {};
}
