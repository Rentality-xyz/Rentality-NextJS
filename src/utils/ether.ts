import { EventLog, Log } from "ethers";

export function isEventLog(log: EventLog | Log): log is EventLog {
  return (log as EventLog).args !== undefined;
}
