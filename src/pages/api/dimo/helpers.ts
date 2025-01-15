// @ts-ignore
import { DIMO } from "@dimo-network/data-sdk/dist/index.d.ts";


export async function authOnDimo() {
 

    const clientId = process.env.NEXT_PUBLIC_SERVER_DIMO_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_SERVER_DIMO_API_KEY;
    const domain = process.env.NEXT_PUBLIC_SERVER_DIMO_DOMAIN;

    if(!clientId || !apiKey || !domain) {
        console.error("DIMO .env is not set")
        return null
      }
  
    const dimo = new DIMO('Production');
  
    const auth = await dimo.auth.getToken({
      client_id: clientId,
      domain,
      private_key: apiKey,
    });

    return {auth, dimo, clientId}
}
export async function tokenExchange(tokenId: number,auth: {headers: {Authorization: string}}, dimo: DIMO, privileges: number[]) {
  return await dimo.tokenexchange.exchange({
        ...auth,
        privileges,
        tokenId,
      });
    
}