// @ts-ignore
import { env } from "@/utils/env";
import { DIMO } from "@dimo-network/data-sdk";

export async function authOnDimo() {
  const clientId = env.NEXT_PUBLIC_SERVER_DIMO_CLIENT_ID;
  const apiKey = env.NEXT_PUBLIC_SERVER_DIMO_API_KEY;
  const domain = env.NEXT_PUBLIC_SERVER_DIMO_DOMAIN;

  if (!clientId || !apiKey || !domain) {
    console.error("DIMO .env is not set");
    return null;
  }

  const dimo = new DIMO("Production");

  const auth = await dimo.auth.getToken({
    client_id: clientId,
    domain,
    private_key: apiKey,
  });

  return { auth, dimo, clientId };
}
export async function tokenExchange(
  tokenId: number,
  auth: { headers: { Authorization: string } },
  dimo: DIMO,
  privileges: number[]
) {
  return await dimo.tokenexchange.exchange({
    ...auth,
    privileges,
    tokenId,
  });
}
