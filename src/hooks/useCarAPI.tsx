import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios";
import { isEmpty } from "@/utils/string";
import { env } from "@/utils/env";
import { VinInfo } from "@/pages/api/car-api/vinInfo";

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

export async function getAuthToken() {
  const CARAPI_SECRET: string = env.NEXT_PUBLIC_SERVER_CARAPI_SECRET!;

  if (!CARAPI_SECRET || isEmpty(CARAPI_SECRET)) {
    throw new Error("CARAPI_SECRET is not set");
  }

  const CARAPI_TOKEN: string = env.NEXT_PUBLIC_SERVER_CARAPI_TOKEN!;

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
