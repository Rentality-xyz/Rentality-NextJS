import { getAuthToken, CarAPIMetadata, CarModelsListElement } from "@/hooks/useCarAPI";
import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

type ModelsResponse = {
  collection: CarAPIMetadata;
  data: CarModelsListElement[];
};

const carAPIURL: string = "https://carapi.app/api/models?make_id=MAKE_ID&page=PAGE";

let carModelsList: CarModelsListElement[] = [];

async function fetchAPage(authToken: string, make_id: string, pageNumber: number) {
  await axios
    .get(carAPIURL.replace("PAGE", String(pageNumber)).replace("MAKE_ID", make_id), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then((res: AxiosResponse<ModelsResponse>) => {
      carModelsList = carModelsList.concat(res.data.data);
      if (res.data.collection.next.length > 0) {
        fetchAPage(authToken, make_id, pageNumber + 1);
      }
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  carModelsList = [];

  const authToken: string = await getAuthToken();

  await fetchAPage(authToken, <string>req.query.make_id, 1);

  return res.status(200).json(carModelsList);
}
