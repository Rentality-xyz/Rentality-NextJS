import { BrowserProvider, EventLog, Log } from "ethers";

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
