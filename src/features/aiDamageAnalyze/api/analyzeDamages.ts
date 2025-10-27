import { getEtherContractWithSigner } from "@/abis";
import { IRentalityAiDamageAnalyzeContract } from "@/features/blockchain/models/IRentalityAiDamageAnalyze";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import axios from "axios";
import { JsonRpcProvider, Wallet } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { createAiDamageAnalyzeCase } from "../models";
import { Err, Ok, Result, UnknownErr } from "@/model/utils/result";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import { logger } from "@/utils/logger";
import { getTripCarPhotos } from "@/features/filestore";
import { CaseType } from "@/model/blockchain/schemas";

export type AnalyzeDamagesParams = {
  tripId: number;
  chainId: number;
  caseNumber: number;
  email: string;
  fullName: string;
  vinNumber: string;
  pre: boolean;
};

export default async function analyzeDamagesHandler(req: NextApiRequest, res: NextApiResponse) {
  const requestResult = validateRequest(req);
  if (!requestResult.ok) {
    logger.error(`analyzeDamagesHandler validation error: ${requestResult.error.message}`);
    res.status(400).json({ error: "Validation error: " + requestResult.error.message });
    return;
  }

  const envsResult = validateEnvs(requestResult.value.chainId);
  if (!envsResult.ok) {
    logger.error(`analyzeDamagesHandler env validation error: ${envsResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  logger.info(
    `\nCalling AnalyzeDamages API with params: 'tripId'=${requestResult.value.tripId} | 'vinNumber'=${requestResult.value.vinNumber} | 'caseNumber'=${requestResult.value.caseNumber} | 'chainId'=${requestResult.value.chainId} | 'pre'=${requestResult.value.pre}`
  );

  const getApiAccessTokenResult = await getApiAccessToken(
    envsResult.value.baseUrl,
    envsResult.value.accountSid,
    envsResult.value.accountSecret
  );
  if (!getApiAccessTokenResult.ok) {
    logger.error(`analyzeDamagesHandler getApiAccessToken error: ${getApiAccessTokenResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const createCaseResult = await createCase(
    requestResult.value,
    envsResult.value.baseUrl,
    getApiAccessTokenResult.value.accessToken
  );
  if (!createCaseResult.ok) {
    logger.error(`analyzeDamagesHandler createCase error: ${createCaseResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }
  logger.info(`\nCase created: 'token'=${createCaseResult.value.token}`);

  const saveCasePhotosResult = await saveCasePhotos(
    requestResult.value.tripId,
    createCaseResult.value.token,
    envsResult.value.baseUrl,
    getApiAccessTokenResult.value.accessToken,
    requestResult.value.pre
  );

  if (!saveCasePhotosResult.ok) {
    logger.error(`analyzeDamagesHandler saveCasePhotos error: ${saveCasePhotosResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  const saveCaseResult = await saveCaseToBlockchain(
    requestResult.value.tripId,
    createCaseResult.value.token,
    requestResult.value.pre,
    envsResult.value.providerApiUrl,
    envsResult.value.privateKey
  );
  if (!saveCaseResult.ok) {
    logger.error(`analyzeDamagesHandler getApiAccessToken error: ${saveCaseResult.error.message}`);
    res.status(500).json({ error: "Something went wrong! Please wait a few minutes and try again" });
    return;
  }

  res.status(200).json({ success: true });
}

function validateRequest(req: NextApiRequest): Result<AnalyzeDamagesParams> {
  const request = <AnalyzeDamagesParams>req.body;

  if (request.tripId == undefined || typeof request.tripId !== "number") {
    return Err(new Error("tripId is missing or not a number"));
  }
  if (request.chainId == undefined || typeof request.chainId !== "number") {
    return Err(new Error("chainId is missing or not a number"));
  }
  if (request.pre == undefined || typeof request.pre !== "boolean") {
    return Err(new Error("pre is missing or not a boolean"));
  }
  if (request.caseNumber == undefined || typeof request.caseNumber !== "number") {
    return Err(new Error("caseNum is missing or not a number"));
  }
  if (isEmpty(request.email)) {
    return Err(new Error("email is missing or is empty"));
  }
  /// Temporary: fullName is saved from Civic, which is no longer available.
  /// Uncomment after updating.
  // if (isEmpty(request.fullName)) {
    // return Err(new Error("name is missing or is empty"));
  // }

  return Ok(request);
}

function validateEnvs(chainId: number) {
  const baseUrl = env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_BASE_URL;
  if (isEmpty(baseUrl)) {
    return Err(new Error("NEXT_PUBLIC_AI_DAMAGE_ANALYZE_BASE_URL was not set"));
  }

  const accountSid = env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SID;
  if (isEmpty(accountSid)) {
    return Err(new Error("NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SID was not set"));
  }

  const accountSecret = env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SECRETKEY;
  if (isEmpty(accountSecret)) {
    return Err(new Error("NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SECRETKEY was not set"));
  }

  const privateKey = env.MANAGER_PRIVATE_KEY;
  if (isEmpty(privateKey)) {
    return Err(new Error("MANAGER_PRIVATE_KEY was not set"));
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);
  if (isEmpty(providerApiUrl)) {
    return Err(new Error(`API URL for chain id ${chainId} was not set`));
  }

  return Ok({ baseUrl, accountSid, accountSecret, privateKey, providerApiUrl: providerApiUrl as string });
}

async function getApiAccessToken(
  baseUrl: string,
  accountSid: string,
  accountSecret: string
): Promise<Result<{ accessToken: string }>> {
  const response = await axios.post(
    `${baseUrl}/access_token`,
    {},
    {
      headers: {
        "Account-SID": accountSid,
        "Account-SecretKey": accountSecret,
      },
    }
  );

  if (response.status !== 200) {
    return Err(new Error("AiDamageAnalyze: failed to create secret with error: ", response.data));
  }

  const accessToken = response.data.access_token;

  if (accessToken === undefined || typeof accessToken !== "string") {
    return Err(new Error("AiDamageAnalyze: access_token is missing in response body"));
  }

  return Ok({ accessToken });
}

async function createCase(
  request: AnalyzeDamagesParams,
  baseUrl: string,
  accessToken: string
): Promise<Result<{ token: string }>> {
  const newCase = createAiDamageAnalyzeCase(
    request.tripId,
    request.chainId,
    request.fullName,
    request.email,
    request.pre,
    new Date().toISOString(),
    request.vinNumber
  );

  try {
    const response = await axios.post(`${baseUrl}/api/v1/case`, newCase, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 201) {
      return Err(new Error("AiDamageAnalyze: failed to create case with error: ", response.data));
    }
    logger.debug("response.data:", JSON.stringify(response.data, null, 2));
    const data = response.data;
    const token = data.case_token["Case token"];
    return Ok({ token });
  } catch (error) {
    return UnknownErr(error);
  }
}

async function saveCasePhotos(
  tripId: number,
  token: string,
  baseUrl: string,
  accessToken: string,
  pre: boolean
): Promise<Result<boolean>> {
  const tripPhotos = await getTripCarPhotos(tripId);
  if (!tripPhotos) {
    return Err(new Error("AiDamageAnalyze: no pre trip photos to upload"));
  }

  const photosToUpload = pre
    ? [...tripPhotos.checkInByGuest, ...tripPhotos.checkInByHost]
    : [...tripPhotos.checkOutByGuest, ...tripPhotos.checkOutByHost];
  if (photosToUpload.length === 0) {
    return Err(new Error("AiDamageAnalyze: no pre trip photos to upload"));
  }

  const form = new FormData();

  photosToUpload.forEach((photoUrl) => {
    form.append("other_side", photoUrl);
  });

  try {
    const response = await axios.post(`${baseUrl}/api/v1/case/${token}/upload_photos`, form, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status !== 200) {
      return Err(new Error("AiDamageAnalyze: failed to upload photo with error: ", response.data));
    }
    logger.debug("response.data:", JSON.stringify(response.data, null, 2));
    return Ok(true);
  } catch (error) {
    logger.error("Error upload photo:", error);
    return UnknownErr(error);
  }
}

async function saveCaseToBlockchain(
  tripId: number,
  token: string,
  pre: boolean,
  providerApiUrl: string,
  privateKey: string
): Promise<Result<boolean>> {
  if (!providerApiUrl) {
    return Err(new Error("providerApiUrl was not set"));
  }
  if (!privateKey) {
    return Err(new Error("privateKey was not set"));
  }

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(privateKey, provider);

  const rentalityAiDamageAnalyze = (await getEtherContractWithSigner(
    "aiDamageAnalyze",
    wallet
  )) as unknown as IRentalityAiDamageAnalyzeContract;
  if (!rentalityAiDamageAnalyze) {
    return Err(new Error("failed to get contract with signer"));
  }

  const caseExists = await rentalityAiDamageAnalyze.isCaseTokenExists(token);
  if (caseExists) {
    return Err(new Error("AiDamageAnalyze: case exists: " + token));
  }

  try {
    const tx = await rentalityAiDamageAnalyze.saveInsuranceCase(
      token,
      BigInt(tripId),
      pre ? CaseType.PreTrip : CaseType.PostTrip
    );
    await tx.wait();
  } catch (error) {
    return Err(new Error("AiDamageAnalyze: failed to save insurance case with error: " + error));
  }

  logger.info("AiDamageAnalyze: case created!", token);
  return Ok(true);
}
