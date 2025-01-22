import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import type { NextApiRequest, NextApiResponse } from "next";
import { ApiUrl } from "./publicSearchCars";

type QueryParams = {
    chainId: string; 
  };
  
export default async function handler(req: NextApiRequest & { query: QueryParams }, res: NextApiResponse<ApiUrl>) {

try {

  let {
    chainId
  } = req.query;

  if (!chainId) {
    const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID

    if (!defaultChain) {
        console.error("API defaultRpcUrl error: chainId was not provided");
        res.status(400).json({ error: "chainId was not provided" });
        return;
      }
      chainId = defaultChain
  }
    const providerApiUrl = getProviderApiUrlFromEnv(Number.parseInt(chainId));
  if (!providerApiUrl) {
    console.error(`API defaultRpcUrl error: API URL for chain id ${chainId} was not set`);
    res.status(500).json({ error: `API defaultRpcUrl error: API URL for chain id ${chainId} was not set` });
    return;
  }
  const result = {
    url: providerApiUrl
  }
  res.status(200).json(result);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "An error occurred during blockchain method call" });
}

}