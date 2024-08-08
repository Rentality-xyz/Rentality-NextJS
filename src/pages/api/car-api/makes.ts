import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { CarAPIMetadata, CarMakesListElement, getAuthToken } from "@/hooks/useCarAPI";

type MakesResponse = {
  "collection": CarAPIMetadata,
  data: CarMakesListElement[]
};

const carAPIURL : string = "https://carapi.app/api/makes?page=PAGE";
const authToken : string = "";

let carMakesList: CarMakesListElement[] = [];

async function fetchAPage(authToken: string, pageNumber: number) {
  await axios.get(carAPIURL.replace("PAGE", String(pageNumber)),
    {
      headers: {
        "accept": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    })
    .then((res: AxiosResponse<MakesResponse>) => {
      carMakesList = carMakesList.concat(res.data.data)
      if(res.data.collection.next.length > 0) {
        fetchAPage(authToken, pageNumber+1);
      }
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  carMakesList = [];

  const authToken : string = await getAuthToken();

  await fetchAPage(authToken, 1)

  return res.status(200).json(carMakesList);
}
