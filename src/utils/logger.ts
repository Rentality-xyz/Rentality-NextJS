import { env, NodeEnv } from "./env";
// import { Logging } from "@google-cloud/logging";

export const LOG_LEVELS = ["trace", "debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

const MIN_CONSOLE_LOG_LEVEL: LogLevel = env.NEXT_PUBLIC_MIN_CONSOLE_LOG_LEVEL || "trace";
const MIN_EXTERNAL_LOG_LEVEL: LogLevel = env.NEXT_PUBLIC_MIN_EXTERNAL_LOG_LEVEL || "info";
const ENV: NodeEnv = env.NEXT_PUBLIC_NODE_ENV || "development";
const IS_PROD_OR_QA = ENV === "production" || ENV === "qa";
const IS_SERVER = typeof window === "undefined";

// const logging = new Logging();
// const log = logging.log("rentality-app");

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(minLevel);
}

function logToExternal(level: LogLevel, message: string, meta?: object) {
  if (!shouldLog(level, MIN_EXTERNAL_LOG_LEVEL)) return;

  const metadata = { severity: level.toUpperCase() };
  //   const entry = log.entry(metadata, { message, ...meta });
  //   log.write(entry).catch(console.error);
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
  if (IS_PROD_OR_QA) logToExternal(level, msg, meta);
};

export const logger = {
  trace: (msg: string, meta?: object) => logMessage("trace", msg, meta),
  debug: (msg: string, meta?: object) => logMessage("debug", msg, meta),
  info: (msg: string, meta?: object) => logMessage("info", msg, meta),
  warn: (msg: string, meta?: object) => logMessage("warn", msg, meta),
  error: (msg: string, meta?: object) => logMessage("error", msg, meta),
};
