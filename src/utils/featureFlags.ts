import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios";
import { logger } from "./logger";

export async function hasFeatureFlag(name: string): Promise<boolean> {
  const response: AxiosResponse = await axios.get(`/api/featureFlags?name=${name}`);

  if (response.status !== 200) {
    logger.info("Feature flag was not fetched: " + response.status + " with data " + response.data);
    return false;
  }

  return response.data == "true";
}
