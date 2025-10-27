import { logger } from "@/utils/logger";
import { getFileHashFromUrl } from "@/features/filestore/utils";

export function getFileURIFromPinata(fileHash: string) {
  return "https://gateway.pinata.cloud/ipfs/" + fileHash;
}

const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
];

export async function getMetaDataFromIpfs(tokenURI: string) {
  const ipfsHash = getFileHashFromUrl(tokenURI);
  if (!ipfsHash) {
    logger.error("Invalid tokenURI or no IPFS hash found:", tokenURI);
    return {};
  }

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

  logger.error("All IPFS gateways failed for:", tokenURI);
  return {};
}