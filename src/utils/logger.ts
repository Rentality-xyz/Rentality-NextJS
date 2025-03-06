import { env, NodeEnv } from "./env";
// import { Logging } from "@google-cloud/logging";

export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

const MIN_CONSOLE_LOG_LEVEL: LogLevel = env.NEXT_PUBLIC_MIN_CONSOLE_LOG_LEVEL || "trace";
const MIN_EXTERNAL_LOG_LEVEL: LogLevel = env.NEXT_PUBLIC_MIN_EXTERNAL_LOG_LEVEL || "info";
const ENV: NodeEnv = env.NEXT_PUBLIC_NODE_ENV || "development";
const IS_SERVER = typeof window === "undefined";
const MAX_CLIENT_LOGS = 100;

// const logging = new Logging();
// const log = logging.log("rentality-app");

const clientLogQueue: { level: LogLevel; message: string; meta?: object }[] = [];

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(minLevel);
}

function logToExternal(level: LogLevel, message: string, meta?: object) {
  if (!shouldLog(level, MIN_EXTERNAL_LOG_LEVEL)) return;

  const metadata = { severity: level.toUpperCase() };
  //   const entry = log.entry(metadata, { message, ...meta });
  //   log.write(entry).catch(console.error);
  console.log(`log ${message} was sent to server`);
}

function formatMessage(level: LogLevel, msg: string) {
  const timestamp = new Date().toISOString();
  const source = IS_SERVER ? "SERVER" : "CLIENT";
  return `[${timestamp}] [${source}] [${level.toUpperCase()}]: ${msg}`;
}

const logMessage = (level: LogLevel, msg: string, meta?: object) => {
  if (shouldLog(level, MIN_CONSOLE_LOG_LEVEL as LogLevel)) {
    console[level](formatMessage(level, msg), meta);
  }
  if (!IS_SERVER) {
    clientLogQueue.push({ level, message: msg, meta });
    if (clientLogQueue.length > MAX_CLIENT_LOGS) {
      clientLogQueue.shift();
    }
  }
};

export const logger = {
  trace: (msg: string, meta?: object) => logMessage("trace", msg, meta),
  debug: (msg: string, meta?: object) => logMessage("debug", msg, meta),
  info: (msg: string, meta?: object) => logMessage("info", msg, meta),
  warn: (msg: string, meta?: object) => logMessage("warn", msg, meta),
  error: (msg: string, meta?: object) => logMessage("error", msg, meta),
  sendToExternal: (minLevel: LogLevel = "info", lastCount: number = MAX_CLIENT_LOGS) => {
    const logsToSend = clientLogQueue.filter((log) => shouldLog(log.level, minLevel)).slice(-lastCount);
    logsToSend.forEach((log) => logToExternal(log.level, log.message, log.meta));
  },
};
