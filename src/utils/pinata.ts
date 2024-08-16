import FormData from "form-data";
import axios from "axios";
import { env } from "./env";

const pinataJwt = env.NEXT_PUBLIC_USE_PINATA_JWT;

export const uploadJSONToIPFS = async (JSONBody: {}, fileNameTag?: string, keyValues?: {}) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const pinataData = {
    pinataContent: JSONBody,
    pinataOptions: { cidVersion: 0 },
    pinataMetadata: { name: fileNameTag, keyvalues: keyValues },
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
};

export const uploadFileToIPFS = async (file: File, fileNameTag?: string, keyValues?: {}) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  if (!fileNameTag) {
    fileNameTag = "rentalityFile";
  }

  let data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: fileNameTag,
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
};
