import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios";
import { logger } from "@/utils/logger";

export async function fetchDefaultRpcUrl(chainId: number): Promise<string> {
  const response: AxiosResponse = await axios.get("/api/defaultRpcUrl", {
    params: {
      chainId: chainId,
    },
  });

  if (response.status !== 200) {
    logger.info("fetchDefaultRpcUrl error: " + response.status + " with data " + response.data);
    return "";
  }
  const { defaultRpcUrl } = response.data;

  if (!defaultRpcUrl) {
    logger.error("fetchDefaultRpcUrl error: Response does not contain the RPC URL");
    return "";
  }

  return defaultRpcUrl;
}
