import { isEmpty } from "@/utils/string";
import type { NextApiRequest, NextApiResponse } from "next";
import { db, loginWithPassword } from "@/utils/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { FIREBASE_DB_NAME } from "@/chat/model/firebaseTypes";
import moment from "moment";
import { Err, Ok, Result } from "@/model/utils/result";

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
  console.log(`\nCalling registeredUsers API with params: 'dateFrom'=${dateFrom} | 'dateTo'=${dateTo}`);

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
  if (!db) return Err("db is null");

  const CIVIC_USER_EMAIL = process.env.CIVIC_USER_EMAIL;
  if (!CIVIC_USER_EMAIL || isEmpty(CIVIC_USER_EMAIL)) {
    console.error("retrieveCivicData error: CIVIC_USER_EMAIL was not set");
    return Err("CIVIC_USER_EMAIL was not set");
  }

  const CIVIC_USER_PASSWORD = process.env.CIVIC_USER_PASSWORD;
  if (!CIVIC_USER_PASSWORD || isEmpty(CIVIC_USER_PASSWORD)) {
    console.error("retrieveCivicData error: CIVIC_USER_PASSWORD was not set");
    return Err("CIVIC_USER_PASSWORD was not set");
  }

  const user = await loginWithPassword(CIVIC_USER_EMAIL, CIVIC_USER_PASSWORD);

  const result: RegisteredUser[] = [];
  const kycInfoQuery = query(collection(db, FIREBASE_DB_NAME.kycInfos));
  const kycInfoQuerySnapshot = await getDocs(kycInfoQuery);
  kycInfoQuerySnapshot.forEach((doc) => {
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
