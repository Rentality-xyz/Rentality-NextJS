import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios"
import { isEmpty } from "@/utils/string";
import { env } from "@/utils/env";
import { VinInfo } from "@/pages/api/car-api/vinInfo";

import { defaultDB } from "@/utils/firebase";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

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

function getExpirationTimestamp(token: string) : number {
  const parsedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
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

    const response = await axios.post(
      "https://carapi.app/api/auth/login",
      {
        api_secret: CARAPI_SECRET,
        api_token: CARAPI_TOKEN,
      },
      {
        headers: {
          "accept": "text/plain",
          "content-type": "application/json",
        },
        cache: {
          ttl: 86400
        }
      }
    );

    return response.data;
  }

export async function getAuthToken() {
  const collectionRef = collection(defaultDB, "car-api-cache");
  const querySnapshot = await getDocs(collectionRef);

  if(!querySnapshot.empty){
    const doc = querySnapshot.docs[0];
    const cachedToken = doc.data().token;

    if (Math.floor(Date.now() / 1000) <= getExpirationTimestamp(cachedToken)){
      console.debug("Car API: Got an auth token from cache");
      return cachedToken;
    } else{
      await deleteDoc(doc.ref);
    }
  }

  const newToken = await getNewAuthToken();

  try {
    await addDoc(collectionRef, {
      token: newToken
    });
    console.debug("Car API: Posted an auth token to cache");
  } catch (e) {
    console.error("Car API: Error caching auth token: ", e);
  }

  return newToken;
}

async function getAllCarMakes(): Promise<CarMakesListElement[]> {
  const response: AxiosResponse<CarMakesListElement[]> = await axios.get("/api/car-api/makes");
  if (response.status !== 200) {
    console.log("Car API for Makes response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

async function getCarModelByMake(make_id: string): Promise<CarModelsListElement[]> {
  const response: AxiosResponse<CarModelsListElement[]> = await axios.get(`/api/car-api/models?make_id=${make_id}`);
  if (response.status !== 200) {
    console.log("Car API for Models response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

async function getCarYearsByMakeAndModel(make_id: string, model_id: string): Promise<string[]> {
  const response: AxiosResponse<string[]> = await axios.get(
    `/api/car-api/years?make_id=${make_id}&model_id=${model_id}`
  );
  if (response.status !== 200) {
    console.log("Car API for Years response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

async function checkVINNumber(vinNumber: string): Promise<boolean> {
  const response: AxiosResponse = await axios.get(`/api/car-api/vin?vin=${vinNumber}`);

  if (response.status !== 200) {
    console.log("Car API for VIN response error code " + response.status + " with data " + response.data);
    return false;
  }

  return response.data.result;
}

async function getVINNumber(vinNumber: string): Promise<VinInfo | undefined> {
  const response: AxiosResponse = await axios.get(`/api/car-api/vinInfo?vin=${vinNumber}`);

  if (response.status !== 200) {
    console.log("Car API for vin info response error code " + response.status + " with data " + response.data);
    return;
  }
  const data = await response.data;
  return data.result;
}

const useCarAPI = () => {
  return { getAllCarMakes, getCarModelByMake, getCarYearsByMakeAndModel, checkVINNumber, getVINNumber } as const;
};

export default useCarAPI;
