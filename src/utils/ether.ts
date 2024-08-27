import { BrowserProvider, Eip1193Provider, EventLog, hexlify, Log, Signer } from "ethers";

export function isEventLog(log: EventLog | Log): log is EventLog {
  return (log as EventLog).args !== undefined;
}

export async function tryGetEnsName(provider: BrowserProvider, walletAddress: string) {
  try {
    return await provider.lookupAddress(walletAddress);
  } catch {
    return null;
  }
}

export async function signMessage(signer: Signer, message: string | Uint8Array): Promise<string> {
  return await signer.signMessage(message);
}

export async function signMessageWithProvider(
  provider: Eip1193Provider,
  walletAddress: string,
  message: string | Uint8Array
): Promise<string> {
  return await provider.request({
    method: "personal_sign",
    params: [hexlify(message), walletAddress.toLowerCase()],
  });
}
