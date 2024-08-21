import { NextApiRequest, NextApiResponse } from "next";
import { getAuthToken } from "@/hooks/useCarAPI";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let carYearsList: string[] = [];

  const authToken: string = await getAuthToken();

  await axios
    .get(`https://carapi.app/api/years?make_id=${req.query.make_id}&make_model_id=${req.query.model_id}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then((res) => {
      carYearsList = res.data;
    });

  return res.status(200).json(carYearsList);
}
