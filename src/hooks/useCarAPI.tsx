import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios";
import { isEmpty } from "@/utils/string";
import { env } from "@/utils/env";
import { VinInfo } from "@/pages/api/car-api/vinInfo";
import { cacheDbInfo, loginWithPassword, readDocFromFirebaseDb, saveDocToFirebaseDb } from "@/utils/firebase";
import { logger } from "@/utils/logger";

export type CarAPIMetadata = {
  url: string;
  count: number;
  pages: number;
  total: number;
  next: string;
  prev: string;
  first: string;
  last: string;
};

export type CarMakesListElement = {
  id: string;
  name: string;
};

export type CarModelsListElement = {
  id: string;
  make_id: string;
  name: string;
};

function getExpirationTimestamp(token: string): number {
  const parsedToken = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  return parsedToken.exp;
}

async function getNewAuthToken() {
  const CARAPI_SECRET: string = env.CARAPI_SECRET!;

  if (!CARAPI_SECRET || isEmpty(CARAPI_SECRET)) {
    throw new Error("CARAPI_SECRET is not set");
  }

  const CARAPI_TOKEN: string = env.CARAPI_TOKEN!;

  if (!CARAPI_TOKEN || isEmpty(CARAPI_TOKEN)) {
    throw new Error("CARAPI_TOKEN is not set");
  }

  logger.debug("getNewAuthToken: Requesting new auth token");

  const response = await axios.post(
    "https://carapi.app/api/auth/login",
    {
      api_secret: CARAPI_SECRET,
      api_token: CARAPI_TOKEN,
    },
    {
      headers: {
        accept: "text/plain",
        "content-type": "application/json",
      },
      cache: {
        ttl: 86400,
      },
    }
  );

  return response.data;
}

export async function getAuthToken() {
  const platformEmail = env.PLATFORM_USER_EMAIL;
  const platformPassword = env.PLATFORM_USER_PASSWORD;

  if (isEmpty(platformEmail) || isEmpty(platformPassword)) {
    logger.debug("getAuthToken error: PLATFORM_USER_EMAIL or PLATFORM_USER_PASSWORD is not set");
    return "";
  }

  await loginWithPassword(platformEmail, platformPassword);

  const getTokenResult = await readDocFromFirebaseDb<{ token: string }>(
    cacheDbInfo.db,
    cacheDbInfo.collections.carApi,
    ["car-api-token"]
  );

  if (!getTokenResult.ok) {
    return "";
  }

  const cachedToken = getTokenResult.value?.token ?? null;

  if (cachedToken !== null && Math.floor(Date.now() / 1000) <= getExpirationTimestamp(cachedToken)) {
    logger.debug("Car API: Got an auth token from cache");
    return cachedToken;
  }

  const newToken = await getNewAuthToken();

  const saveResult = await saveDocToFirebaseDb(cacheDbInfo.db, cacheDbInfo.collections.carApi, ["car-api-token"], {
    token: newToken,
  });

  if (saveResult.ok) {
    logger.debug("Car API: Posted an auth token to cache");
  } else {
    logger.error("Car API: Error caching auth token: ", saveResult.error);
  }

  return newToken;
}

async function getAllCarMakes(): Promise<CarMakesListElement[]> {
  const response: AxiosResponse<CarMakesListElement[]> = await axios.get("/api/car-api/makes");
  if (response.status !== 200) {
    logger.info("Car API for Makes response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

async function getCarModelByMake(make_id: string): Promise<CarModelsListElement[]> {
  const response: AxiosResponse<CarModelsListElement[]> = await axios.get(`/api/car-api/models?make_id=${make_id}`);
  if (response.status !== 200) {
    logger.info("Car API for Models response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

async function getCarYearsByMakeAndModel(make_id: string, model_id: string): Promise<string[]> {
  const response: AxiosResponse<string[]> = await axios.get(
    `/api/car-api/years?make_id=${make_id}&model_id=${model_id}`
  );
  if (response.status !== 200) {
    logger.info("Car API for Years response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

async function checkVINNumber(vinNumber: string): Promise<boolean> {
  const response: AxiosResponse = await axios.get(`/api/car-api/vin?vin=${vinNumber}`);

  if (response.status !== 200) {
    logger.info("Car API for VIN response error code " + response.status + " with data " + response.data);
    return false;
  }

  return response.data.result;
}

async function getVINNumber(vinNumber: string): Promise<VinInfo | undefined> {
  const response: AxiosResponse = await axios.get(`/api/car-api/vinInfo?vin=${vinNumber}`);

  if (response.status !== 200) {
    logger.info("Car API for vin info response error code " + response.status + " with data " + response.data);
    return;
  }
  const data = await response.data;
  return data.result;
}

const useCarAPI = () => {
  return { getAllCarMakes, getCarModelByMake, getCarYearsByMakeAndModel, checkVINNumber, getVINNumber } as const;
};

export default useCarAPI;
