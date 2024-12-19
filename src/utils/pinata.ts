import FormData from "form-data";
import axios from "axios";
import { env } from "./env";
import { Err, Ok, Result } from "@/model/utils/result";

const pinataJwt = env.NEXT_PUBLIC_PINATA_JWT;

export async function uploadJSONToIPFS(JSONBody: {}, fileNameTag?: string, keyValues?: {}) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const fileNameExt =
    keyValues !== undefined && "chainId" in keyValues && typeof keyValues.chainId === "string"
      ? `_${keyValues.chainId}`
      : "";

  const pinataData = {
    pinataContent: JSONBody,
    pinataOptions: { cidVersion: 0 },
    pinataMetadata: { name: fileNameTag + fileNameExt, keyvalues: keyValues },
  };

  return axios
    .post(url, pinataData, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then(function (response) {
      console.log("JSON uploaded", response.data.IpfsHash);
      return {
        success: true,
        pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
      } as const;
    })
    .catch(function (error) {
      console.error(error);
      return {
        success: false,
        message: error.message,
      } as const;
    });
}

export async function uploadFileToIPFS(file: File, fileNameTag?: string, keyValues?: {}) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const fileNameExt =
    keyValues !== undefined && "chainId" in keyValues && typeof keyValues.chainId === "string"
      ? `_${keyValues.chainId}`
      : "";

  if (!fileNameTag) {
    fileNameTag = "rentalityFile";
  }

  let data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: fileNameTag + fileNameExt,
    keyvalues: keyValues,
  });
  data.append("pinataMetadata", metadata);

  const pinataOptions = JSON.stringify({
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
  data.append("pinataOptions", pinataOptions);

  return axios
    .post(url, data, {
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": `multipart/form-data; boundary=undefined}`,
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then((response) => {
      console.log("file uploaded", response.data.IpfsHash);
      return {
        success: true,
        pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
      } as const;
    })
    .catch((error) => {
      console.error(error);
      return {
        success: false,
        message: error.message,
      } as const;
    });
}

export async function deleteFileFromIPFS(ipfsHash: string): Promise<Result<boolean, string>> {
  const url = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;

  return axios
    .delete(url, {
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    })
    .then((response) => {
      console.log("file deleted", response.data.IpfsHash);
      return Ok(true);
    })
    .catch((error) => {
      console.error(error);
      return Err(error.message);
    });
}
