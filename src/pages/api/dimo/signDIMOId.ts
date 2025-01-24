import { NextApiRequest, NextApiResponse } from "next";
import { authOnDimo, tokenExchange } from "./helpers";
import { DIMOSharedCarsResponse } from "./dimo";
import { Err, Ok, Result } from "@/model/utils/result";
import { isEmpty } from "@/utils/string";
import { id, JsonRpcProvider, Wallet } from "ethers";
import { signMessage } from "@/utils/ether";

function parseQuery(req: NextApiRequest): Result<{ address: string; chainId: number; providerApiUrl: string, dimoToken: number }, string> {
  const { address: addressQuery, chainId: chainIdQuery } = req.query;
  const address = typeof addressQuery === "string" ? addressQuery : "";
  const chainId = typeof chainIdQuery === "string" ? Number(chainIdQuery) : 0;
  const dimoToken = typeof req.query.dimoToken === "string" ? Number(req.query.dimoToken) : 0;

  if (isEmpty(address)) {
    return Err("'address' is not provided or empty");
  }
  if (Number.isNaN(chainId) || chainId === 0) {
    return Err("'chainId' is not provided or is not a number");
  }
  if(Number.isNaN(dimoToken) || dimoToken === 0) {
    return Err("'dimo token' is not provided or is not a number");  
}
  let providerApiUrl = process.env[`PROVIDER_API_URL_${chainId}`];
  if (!providerApiUrl) {
    console.error(`API signLocation error: API URL for chain id ${chainId} was not set`);
    return Err(`Chain id ${chainId} is not supported`);
  }

  return Ok({ address, chainId, providerApiUrl, dimoToken });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = await authOnDimo()

  if(authResult === null)
    return

  const {auth, dimo, clientId} = authResult

  const parseQueryResult = parseQuery(req);
  if (!parseQueryResult.ok) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }

  const { address, providerApiUrl, dimoToken } = parseQueryResult.value;

  const userCarsOnDimo = await dimo.identity.query({
    query: `
    {
      vehicles(filterBy: {privileged: "${clientId}", owner: "${address}"}, first: 100) {
        nodes {
          tokenId
          definition {
            make
            model
            year,
            id
          }
        }
      }
    }`
  });

  const result = (userCarsOnDimo as unknown as DIMOSharedCarsResponse).data.vehicles.nodes.find(token => {
    token.tokenId === dimoToken
  });
  if(!result) {
    return res.status(404).json({error: "Car not found"})
  }
 
    const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
    if (!SIGNER_PRIVATE_KEY) {
        console.error("SignDimo error: SIGNER_PRIVATE_KEY was not set");
        res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
        return;
      }
    
  const provider = new JsonRpcProvider(providerApiUrl);
  const signer = new Wallet(SIGNER_PRIVATE_KEY, provider);

 const signature = await signMessage(signer, dimoToken.toString())

 res.status(200).json({ signature });
  return;

}
