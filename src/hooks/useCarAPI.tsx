import axios, { AxiosResponse } from "axios";
import { isEmpty } from "@/utils/string";

export type CarAPIMetadata = {
  "url": string,
  "count": number,
  "pages": number,
  "total": number,
  "next": string,
  "prev": string,
  "first": string,
  "last": string
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

export async function getAuthToken(){
  const CARAPI_SECRET: string = process.env.CARAPI_SECRET!;

  if (!CARAPI_SECRET || isEmpty(CARAPI_SECRET)) {
    throw new Error("CARAPI_SECRET is not set");
  }

  const CARAPI_TOKEN : string = process.env.CARAPI_TOKEN!;

  if (!CARAPI_TOKEN || isEmpty(CARAPI_TOKEN)) {
    throw new Error("CARAPI_TOKEN is not set");
  }

  const response = await axios.post("https://carapi.app/api/auth/login", {
    api_secret: CARAPI_SECRET,
    api_token : CARAPI_TOKEN
  },{
    headers: {
      "accept" : "text/plain",
      "content-type" : "application/json"
    }
  });

  return response.data;
}

async function getAllCarMakes () : Promise<CarMakesListElement[]> {
  const response : AxiosResponse<CarMakesListElement[]> = await axios.get("/api/car-api/makes");
  if(response.status !== 200) {
    console.log("Car API for Makes response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

async function getCarModelByMake(make_id: string) : Promise<CarModelsListElement[]> {
  const response : AxiosResponse<CarModelsListElement[]> = await axios.get("/api/car-api/models?make_id=" + make_id);
  if(response.status !== 200) {
    console.log("Car API for Models response error code " + response.status + " with data " + response.data);
    return [];
  }
  return response.data;
}

const useCarAPI = () => {
  return {getAllCarMakes, getCarModelByMake} as const;
}

export default useCarAPI;