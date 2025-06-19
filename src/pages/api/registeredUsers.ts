import { isEmpty } from "@/utils/string";
import type { NextApiRequest, NextApiResponse } from "next";
import { kycDbInfo, loginWithPassword, readDocsFromFirebaseDb } from "@/utils/firebase";
import moment from "moment";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";

type RegisteredUser = {
  email: string;
  updateDate: string;
};

export type RegisteredUsersRequest = {
  dateFrom?: string;
  dateTo?: string;
};

export type RegisteredUsersResponse = { data: RegisteredUser[] } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<RegisteredUsersResponse>) {
  const parseQueryResult = parseQuery(req);
  if (!parseQueryResult.ok) {
    res.status(400).json({ error: parseQueryResult.error });
    return;
  }

  const { dateFrom, dateTo } = parseQueryResult.value;
  logger.info(`\nCalling registeredUsers API with params: 'dateFrom'=${dateFrom} | 'dateTo'=${dateTo}`);

  const getRegisteredUsersResult = await getRegisteredUsers(dateFrom, dateTo);

  if (!getRegisteredUsersResult.ok) {
    res.status(500).json({ error: getErrorMessage(getRegisteredUsersResult.error) });
    return;
  }

  res.status(200).json({ data: getRegisteredUsersResult.value });
  return;
}

function parseQuery(req: NextApiRequest): Result<{ dateFrom?: Date | undefined; dateTo?: Date | undefined }, string> {
  const { dateFrom: dateFromQuery, dateTo: dateToQuery } = req.query;

  const dateFrom = typeof dateFromQuery === "string" ? moment(dateFromQuery).toDate() : undefined;
  const dateTo = typeof dateToQuery === "string" ? moment(dateToQuery).toDate() : undefined;

  if ((dateFrom && Number.isNaN(dateFrom.getTime())) || (dateTo && Number.isNaN(dateTo.getTime()))) {
    return Err("dateFrom and dateTo should be in date format");
  }
  return Ok({ dateFrom, dateTo });
}

async function getRegisteredUsers(
  dateFrom: Date | undefined,
  dateTo: Date | undefined
): Promise<Result<RegisteredUser[], string>> {
  if (!kycDbInfo.db) return Err("db is null");

  const platformEmail = env.PLATFORM_USER_EMAIL;
  const platformPassword = env.PLATFORM_USER_PASSWORD;

  if (isEmpty(platformEmail) || isEmpty(platformPassword)) {
    return Err("PLATFORM_USER_EMAIL or PLATFORM_USER_PASSWORD is not set");
  }

  await loginWithPassword(platformEmail, platformPassword);

  const kycInfoDocsResult = await readDocsFromFirebaseDb(kycDbInfo.db, kycDbInfo.collections.kycInfos);

  if (!kycInfoDocsResult.ok) {
    logger.error(`getRegisteredUsers error: kycInfoDocsResult error: ${kycInfoDocsResult.error}`);
    return Err(kycInfoDocsResult.error.message);
  }

  const result: RegisteredUser[] = [];
  kycInfoDocsResult.value?.forEach((doc) => {
    const updateDate = doc.data().updateDate;
    if (
      (!dateFrom || !updateDate || moment(updateDate).toDate() >= dateFrom) &&
      (!dateTo || !updateDate || moment(updateDate).toDate() <= dateTo)
    ) {
      result.push({ email: doc.data().verifiedInformation.email, updateDate: updateDate ?? "" });
    }
  });
  return Ok(result);
}

function getErrorMessage(debugMessage: string) {
  const isDebug = true;
  return isDebug ? debugMessage : "Something went wrong! Please wait a few minutes and try again";
}
