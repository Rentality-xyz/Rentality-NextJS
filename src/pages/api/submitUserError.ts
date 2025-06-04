import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger, StoredLog } from "@/utils/logger";
import { getErrorMessage } from "@/utils/exception";
import { cacheDbInfo, loginWithPassword, saveDocToFirebaseDb } from "@/utils/firebase";
import moment from "moment";

export type RequestBody = { userDescription: string; lastLogs: StoredLog[] };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    logger.error("submitUserError error: method not allowed");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userDescription, lastLogs } = req.body;

  if (!Array.isArray(lastLogs) || (lastLogs.length === 0 && isEmpty(userDescription))) {
    logger.error("submitUserError error: invalid parameters");
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  logger.info(`\nCalling Submit user error API with params: 'userDescription'=${userDescription}`);

  const saveDataResult = await saveUserError(userDescription, lastLogs);

  logger.info(`saveDataResult: ${JSON.stringify(saveDataResult)}`);

  if (!saveDataResult.ok) {
    res.status(500).json({ error: getErrorMessage(`saveDataResult error: ${saveDataResult.error}`) });
    return;
  }

  res.status(200).json({ ok: true });
  return;
}

async function saveUserError(userDescription: string, lastLogs: StoredLog[]): Promise<Result<boolean, string>> {
  if (!cacheDbInfo.db) return Err("db is null");

  const CIVIC_USER_EMAIL = env.CIVIC_USER_EMAIL;
  if (!CIVIC_USER_EMAIL || isEmpty(CIVIC_USER_EMAIL)) {
    logger.error("submitUserError error: CIVIC_USER_EMAIL was not set");
    return Err("CIVIC_USER_EMAIL was not set");
  }

  const CIVIC_USER_PASSWORD = env.CIVIC_USER_PASSWORD;
  if (!CIVIC_USER_PASSWORD || isEmpty(CIVIC_USER_PASSWORD)) {
    logger.error("submitUserError error: CIVIC_USER_PASSWORD was not set");
    return Err("CIVIC_USER_PASSWORD was not set");
  }

  await loginWithPassword(CIVIC_USER_EMAIL, CIVIC_USER_PASSWORD);

  const saveResult = await saveDocToFirebaseDb(
    cacheDbInfo.db,
    cacheDbInfo.collections.userErrors,
    [moment().unix().toString()],
    { userDescription, lastLogs }
  );

  if (!saveResult.ok) {
    return Err(saveResult.error.message);
  }

  return Ok(true);
}
