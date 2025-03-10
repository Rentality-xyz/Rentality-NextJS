import moment from "moment";
import { LOG_LEVELS, LogLevel } from "./constants";
import { env } from "./env";
// import { Logging } from "@google-cloud/logging";

const MIN_CONSOLE_LOG_LEVEL: LogLevel = env.NEXT_PUBLIC_MIN_CONSOLE_LOG_LEVEL || "trace";
const MIN_EXTERNAL_LOG_LEVEL: LogLevel = env.NEXT_PUBLIC_MIN_EXTERNAL_LOG_LEVEL || "info";
const IS_SERVER = typeof window === "undefined";
const MAX_CLIENT_LOGS = 20;

// const logging = new Logging();
// const log = logging.log("rentality-app");
export type StoredLog = { timestamp: string; level: LogLevel; message: string; meta?: object };
const clientLogQueue: StoredLog[] = [];

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(minLevel);
}

function formatConsoleMessage(level: LogLevel, msg: string) {
  return `[${level.toUpperCase()}]: ${msg}`;
}

function logMessage(level: LogLevel, message?: any, ...optionalParams: any[]) {
  if (shouldLog(level, MIN_CONSOLE_LOG_LEVEL)) {
    console[level](formatConsoleMessage(level, message), ...optionalParams);
  }
  if (!IS_SERVER) {
    clientLogQueue.push({
      timestamp: moment().toISOString(),
      level,
      message,
      meta: {
        optionalParams: optionalParams.map((i) => {
          if (i instanceof Error) {
            return { error: i.message, stack: i.stack };
          } else return i;
        }),
      },
    });
    if (clientLogQueue.length > MAX_CLIENT_LOGS) {
      clientLogQueue.shift();
    }
  }
}

function logToExternal(logToSend: StoredLog) {
  if (!shouldLog(logToSend.level, MIN_EXTERNAL_LOG_LEVEL)) return;

  const metadata = { severity: logToSend.level.toUpperCase() };
  //   const entry = log.entry(metadata, { message, ...meta });
  //   log.write(entry).catch(console.error);
  console.log(
    `log ${JSON.stringify({ timestamp: logToSend.timestamp, message: logToSend.message, meta: logToSend.meta })} was sent to server`
  );
}

function sendLogsToExternal(minLevel: LogLevel = "info", lastCount: number = MAX_CLIENT_LOGS) {
  const logsToSend = clientLogQueue.filter((log) => shouldLog(log.level, minLevel)).slice(-lastCount);
  logsToSend.forEach(logToExternal);
}

export const logger = {
  trace: (message: string, ...optionalParams: any[]) => logMessage("trace", message, ...optionalParams),
  debug: (message: string, ...optionalParams: any[]) => logMessage("debug", message, ...optionalParams),
  info: (message: string, ...optionalParams: any[]) => logMessage("info", message, ...optionalParams),
  warn: (message: string, ...optionalParams: any[]) => logMessage("warn", message, ...optionalParams),
  error: (message: string, ...optionalParams: any[]) => logMessage("error", message, ...optionalParams),
  sendToExternal: sendLogsToExternal,
  getLastStoredLogs: () => [...clientLogQueue],
};
