import { isEmpty } from "@/utils/string";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { kycDbInfo, storage, loginWithPassword, saveDocToFirebaseDb } from "@/utils/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { env } from "@/utils/env";
import moment from "moment";
import { Err, Ok, Result } from "@/model/utils/result";
import { getEtherContractWithSigner } from "@/abis";
import { JsonRpcProvider, Wallet } from "ethers";
import { ContractCivicKYCInfo } from "@/model/blockchain/schemas";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { IRentalityGatewayContract } from "@/features/blockchain/models/IRentalityGateway";
import { logger } from "@/utils/logger";

export type RetrieveCivicDataRequest = {
  requestId: string;
};

export type RetrieveCivicDataResponse =
  | {
      success: true;
    }
  | {
      error: string;
    };

type PiiLink = {
  rel: string;
  href: string;
};

type PiiDocData = {
  rel: string;
  data: string;
  mimeType: string;
};

type PiiVerifiedInformation = {
  issueCountry: string;
  name: string;
  email: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  documentType: string;
  documentNumber: string;
  address: string;
  accountId: string;
};

type AllPiiInfo = {
  id: string;
  type: string;
  status: string;
  links: PiiLink[];
  verifiedInformation: PiiVerifiedInformation;
  updateDate: string;
};

const GET_AUTH_TOKEN_URL = "https://auth0.civic.com/oauth/token";
const GET_ALL_PIIS_URL = "https://api.civic.com/partner/piirequest/REQUEST_ID";
const UPDATE_STATUS_URL = "https://api.civic.com/partner/piirequest/REQUEST_ID/status";

export default async function handler(req: NextApiRequest, res: NextApiResponse<RetrieveCivicDataResponse>) {
  const CIVIC_CLIENT_ID = env.CIVIC_CLIENT_ID;
  if (!CIVIC_CLIENT_ID || isEmpty(CIVIC_CLIENT_ID)) {
    logger.error("retrieveCivicData error: CIVIC_CLIENT_ID was not set");
    res.status(500).json({ error: getErrorMessage("retrieveCivicData error: CIVIC_CLIENT_ID was not set") });
    return;
  }

  const CIVIC_CLIENT_SECRET = env.CIVIC_CLIENT_SECRET;
  if (!CIVIC_CLIENT_SECRET || isEmpty(CIVIC_CLIENT_SECRET)) {
    logger.error("retrieveCivicData error: CIVIC_CLIENT_SECRET was not set");
    res.status(500).json({ error: getErrorMessage("retrieveCivicData error: CIVIC_CLIENT_SECRET was not set") });
    return;
  }

  const MANAGER_PRIVATE_KEY = env.MANAGER_PRIVATE_KEY;
  if (isEmpty(MANAGER_PRIVATE_KEY)) {
    logger.error("retrieveCivicData error: private key was not set");
    res.status(500).json({ error: getErrorMessage("private key was not set") });
    return;
  }

  const SIGNER_PRIVATE_KEY = env.SIGNER_PRIVATE_KEY;
  if (isEmpty(SIGNER_PRIVATE_KEY)) {
    logger.error("retrieveCivicData error: private key was not set");
    res.status(500).json({ error: getErrorMessage("private key was not set") });
    return;
  }

  const { chainId, requestId: requestIdQuery } = req.query;
  const requestId = typeof requestIdQuery === "string" ? requestIdQuery : "";

  if (isEmpty(requestId)) {
    res.status(400).json({ error: "'requestId' is not provided or empty" });
    return;
  }

  const chainIdNumber = typeof chainId === "string" && !isEmpty(chainId) && Number(chainId) > 0 ? Number(chainId) : 0;
  if (!chainIdNumber) {
    logger.error("retrieveCivicData error: chainId was not provided");
    res.status(400).json({ error: "chainId was not provided" });
    return;
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainIdNumber);
  if (!providerApiUrl) {
    logger.error(`retrieveCivicData error: API URL for chain id ${chainIdNumber} was not set`);
    res
      .status(500)
      .json({ error: getErrorMessage(`retrieveCivicData error: API URL for chain id ${chainIdNumber} was not set`) });
    return;
  }

  logger.info(`\nCalling retrieveCivicData API with requestId:${requestId} and chainId:${chainIdNumber}`);
  const authTokenResult = await getAuthToken(CIVIC_CLIENT_ID, CIVIC_CLIENT_SECRET);

  if (!authTokenResult.ok) {
    res.status(500).json({ error: getErrorMessage(`authTokenResult error: ${authTokenResult.error}`) });
    return;
  }

  const allPIIsResult = await getAllPIIs(requestId, authTokenResult.value);
  if (!allPIIsResult.ok) {
    res.status(500).json({ error: getErrorMessage(`allPIIsResult error: ${allPIIsResult.error}`) });
    return;
  }
  logger.info(`PII data was received successfully`);

  const PiiDocDatas = await getPiiDocs(allPIIsResult.value.links, authTokenResult.value);
  if (!PiiDocDatas.ok) {
    res.status(500).json({ error: getErrorMessage(`PiiDocDatas error: ${PiiDocDatas.error}`) });
    return;
  }
  logger.info(`PII docs were received successfully`);

  const saveDataResult = await savePiiInfoToFirebase(allPIIsResult.value, PiiDocDatas.value);

  logger.info(`saveDataResult: ${JSON.stringify(saveDataResult)}`);

  if (!saveDataResult.ok) {
    res.status(500).json({ error: getErrorMessage(`saveDataResult error: ${saveDataResult.error}`) });
    return;
  }
  logger.info(`PII data was saved successfully`);

  const updateStatusResult = await updateStatus(requestId, true, authTokenResult.value);
  if (!updateStatusResult.ok) {
    res.status(500).json({ error: getErrorMessage(`updateStatusResult error: ${updateStatusResult.error}`) });
    return;
  }
  logger.info(`Civic status was updated successfully`);

  const resetUserKycCommissionResult = await resetUserKycCommission(
    allPIIsResult.value.verifiedInformation,
    providerApiUrl,
    MANAGER_PRIVATE_KEY
  );

  if (!resetUserKycCommissionResult.ok) {
    res
      .status(500)
      .json({ error: getErrorMessage(`resetUserKycCommissionResult error: ${resetUserKycCommissionResult.error}`) });
    return;
  }
  logger.info(`User KYC Commission was reset successfully`);

  const saveKycInfoResult = await saveKycInfo(
    allPIIsResult.value.verifiedInformation,
    MANAGER_PRIVATE_KEY,
    providerApiUrl
  );

  if (!saveKycInfoResult.ok) {
    res.status(500).json({ error: getErrorMessage(`sign KYC info error: ${saveKycInfoResult.error}`) });
    return;
  }

  res.status(200).json({
    success: true,
  });
  return;
}

async function getAuthToken(clientId: string, clientSecret: string): Promise<Result<string, string>> {
  const data = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    audience: "https://api.civic.com/pass",
    grant_type: "client_credentials",
  });
  return axios
    .post(GET_AUTH_TOKEN_URL, data, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
    })
    .then(function (response) {
      if ("access_token" in response.data) {
        return Ok(response.data.access_token as string);
      }
      return Err("response does not contain access_token");
    })
    .catch((error) => {
      logger.error("getAuthToken error", error);
      return Err(error.message);
    });
}

async function getAllPIIs(requestId: string, authToken: string): Promise<Result<AllPiiInfo, string>> {
  return axios
    .get(GET_ALL_PIIS_URL.replace("REQUEST_ID", requestId), {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then(function (response) {
      if (response.status !== 200) {
        return Err(response.statusText);
      }
      return Ok({ ...response.data, updateDate: moment().toISOString() } as AllPiiInfo);
    })
    .catch((error) => {
      logger.error("getAllPIIs error", error);
      return Err(error.message);
    });
}

async function getPIIByLink(
  link: string,
  authToken: string
): Promise<Result<{ data: string; mimeType: string }, string>> {
  return axios
    .get(link, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      responseType: "arraybuffer",
    })
    .then(function (response) {
      return Ok({ data: response.data, mimeType: response.headers["content-type"].toString() });
    })
    .catch((error) => {
      logger.error("getPIIByLink error", error);
      return Err(error.message);
    });
}

async function getPiiDocs(links: PiiLink[], authToken: string): Promise<Result<PiiDocData[], string>> {
  const piiDocPicsPromises = links.map(async (link) => {
    const dataResponse = await getPIIByLink(link.href, authToken);
    if (dataResponse.ok) {
      return {
        rel: link.rel,
        data: dataResponse.value.data,
        mimeType: dataResponse.value.mimeType,
      } as PiiDocData;
    }
    return { rel: link.rel, data: "", mimeType: "" } as PiiDocData;
  });
  const piiDocPics = await Promise.all(piiDocPicsPromises);

  if (piiDocPics.find((i) => isEmpty(i.data)) !== undefined) {
    return Err("Some docs is not retrived");
  }
  return Ok(piiDocPics);
}

async function saveDocs(address: string, docs: PiiDocData[]): Promise<Result<PiiLink[], string>> {
  if (!storage) return Err("storage is null");

  const saveDocsResultPromise = docs.map(async (doc) => {
    const docRef = ref(storage, `kycdocs/${address}_${doc.rel}.jpg`);
    try {
      const snapshot = await uploadBytes(
        docRef,
        new Blob([doc.data], {
          type: doc.mimeType,
        })
      );
      return { rel: doc.rel, href: snapshot.ref.fullPath };
    } catch (error) {
      logger.error("saveDocs error", error);

      return { rel: doc.rel, href: undefined };
    }
  });
  const saveDocsResult = await Promise.all(saveDocsResultPromise);

  if (saveDocsResult.find((i) => i.href === undefined) !== undefined) {
    return Err("saveDocs errors");
  }

  return Ok(saveDocsResult as PiiLink[]);
}

async function savePiiInfoToFirebase(allInfo: AllPiiInfo, docs: PiiDocData[]): Promise<Result<boolean, string>> {
  if (!kycDbInfo.db) return Err("db is null");

  const platformEmail = env.PLATFORM_USER_EMAIL;
  const platformPassword = env.PLATFORM_USER_PASSWORD;

  if (isEmpty(platformEmail) || isEmpty(platformPassword)) {
    return Err("PLATFORM_USER_EMAIL or PLATFORM_USER_PASSWORD is not set");
  }

  await loginWithPassword(platformEmail, platformPassword);

  const savedDocsResult = await saveDocs(allInfo.verifiedInformation.address, docs);

  if (!savedDocsResult.ok) {
    return Err("saveDocs error");
  }
  allInfo.links = savedDocsResult.value;

  const saveResult = await saveDocToFirebaseDb(
    kycDbInfo.db,
    kycDbInfo.collections.kycInfos,
    [allInfo.verifiedInformation.address],
    allInfo
  );
  if (!saveResult.ok) {
    return Err(saveResult.error.message);
  }
  return Ok(true);
}

async function updateStatus(requestId: string, isPassed: boolean, authToken: string): Promise<Result<any, string>> {
  const data = JSON.stringify({
    status: isPassed ? "partner-pass" : "partner-fail",
  });
  return axios
    .put(UPDATE_STATUS_URL.replace("REQUEST_ID", requestId), data, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then(function (response) {
      return Ok(response.data);
    })
    .catch((error) => {
      logger.error("updateStatus error", error);
      return Err(error.message);
    });
}

async function resetUserKycCommission(
  verifiedInformation: PiiVerifiedInformation,
  providerApiUrl: string,
  privateKey: string
): Promise<Result<boolean, string>> {
  if (!verifiedInformation || isEmpty(verifiedInformation.address)) {
    logger.error("verifiedInformation or address is empty");
    return Err("verifiedInformation or address is empty");
  }

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(privateKey, provider);

  const rentality = (await getEtherContractWithSigner("gateway", wallet)) as unknown as IRentalityGatewayContract;

  if (rentality === null) {
    logger.error("rentality is null");
    return Err("rentality is null");
  }
  try {
    const transaction = await rentality.useKycCommission(verifiedInformation.address);
    await transaction.wait();
    return Ok(true);
  } catch (error) {
    logger.error("useKycCommission error", error);
    return Err(`useKycCommission error ${error}`);
  }
}

async function saveKycInfo(
  verifiedInformation: PiiVerifiedInformation,
  managerPrivateKey: string,
  providerApiUrl: string
): Promise<Result<boolean, string>> {
  if (!verifiedInformation || isEmpty(verifiedInformation.address)) {
    logger.error("verifiedInformation or address is empty");
    return Err("verifiedInformation or address is empty");
  }

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(managerPrivateKey, provider);
  const contractCivicKYCInfo: ContractCivicKYCInfo = {
    fullName: verifiedInformation.name,
    licenseNumber: verifiedInformation.documentNumber,
    expirationDate: !isEmpty(verifiedInformation.dateOfExpiry)
      ? getBlockchainTimeFromDate(moment.utc(verifiedInformation.dateOfExpiry).toDate())
      : BigInt(0),
    issueCountry: verifiedInformation.issueCountry,
    email: verifiedInformation.email,
  };

  const rentality = (await getEtherContractWithSigner("gateway", wallet)) as unknown as IRentalityGatewayContract;

  if (rentality === null) {
    logger.error("rentality is null");
    return Err("rentality is null");
  }
  try {
    const transaction = await rentality.setCivicKYCInfo(verifiedInformation.address, contractCivicKYCInfo);
    await transaction.wait();
    return Ok(true);
  } catch (error) {
    logger.error("useKycCommission error", error);
    return Err(`useKycCommission error ${error}`);
  }
}

function getErrorMessage(debugMessage: string) {
  const isDebug = true;
  return isDebug ? debugMessage : "Something went wrong! Please wait a few minutes and try again";
}
