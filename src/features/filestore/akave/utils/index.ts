import { logger } from "@/utils/logger";

export function getFileURIFromAkave(fileHash: string) {
  return "https://o3-rc3.akave.xyz/rentality-test-bucket/" + fileHash;
}

export async function getMetaDataFromAkave(key: string): Promise<Record<string, unknown>> {
  if (!key) {
    logger.error("Empty Akave key");
    return {};
  }
  const url = getFileURIFromAkave(key);
  try {
    logger.info(`Fetching metadata from ${url}`);
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      logger.warn(`Akave returned status ${response.status}`);
      return {};
    }
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    logger.warn(`Error fetching from Akave: ${String(error)}`);
    return {};
  }
}
