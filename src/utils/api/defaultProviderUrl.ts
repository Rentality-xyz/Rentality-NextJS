import { JsonRpcProvider } from "ethers";
import { env } from "../env";
import getProviderApiUrlFromEnv from "./providerApiUrl";
import { fetchDefaultRpcUrl } from "@/features/notifications/utils/fetchDefaultRpcUrl";
import { MulticallWrapper } from "ethers-multicall-provider";


export default async function getDefaultProvider() {
    const url = await fetchDefaultRpcUrl(env.NEXT_PUBLIC_DEFAULT_CHAIN_ID);
    return MulticallWrapper.wrap(new JsonRpcProvider(url));
}
