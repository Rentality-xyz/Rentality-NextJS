import { JsonRpcProvider } from "ethers";
import { env } from "../env";


export default function getDefaultProvider() {
    return  new JsonRpcProvider(env.NEXT_PUBLIC_DEFAULT_RPC_URL);
}
