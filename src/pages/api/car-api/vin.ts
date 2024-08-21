import { NextApiRequest, NextApiResponse } from "next";
import { getAuthToken } from "@/hooks/useCarAPI";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let responseCode: number = 0;

  const authToken: string = await getAuthToken();

  await axios
    .get(`https://carapi.app/api/vin/${req.query.vin}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then((res) => {
      responseCode = res.status;
    })
    .catch(function (error) {
      responseCode = error.response?.status || 503;
    });

  return res.status(200).json({ result: responseCode !== 404 });
}
