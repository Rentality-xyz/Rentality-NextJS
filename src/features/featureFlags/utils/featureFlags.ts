import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios";
import { logger } from "@/utils/logger";

export async function hasFeatureFlag(name: string): Promise<boolean> {
  const response: AxiosResponse = await axios.get(`/api/featureFlags?name=${name}`);

  if (response.status !== 200) {
    logger.error("Feature flag was not fetched: " + response.status + " with data " + response.data);
    return false;
  }

  return response.data == "true";
}
