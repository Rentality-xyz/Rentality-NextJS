import { NextApiRequest, NextApiResponse } from "next";
import { getAuthToken } from "@/hooks/useCarAPI";
import axios from "axios";

interface CarData {
  make: string;
  model: string;
  year: number;
}

export type VinInfo = {
  exists: boolean;
  brand?: string;
  model?: string;
  yearOfProduction?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let responseCode: number = 0;
  let data: CarData | undefined;

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
      if (responseCode === 200) data = res.data;
    })
    .catch(function (error) {
      responseCode = error.response?.status || 503;
    });
  if (data !== undefined)
    return res.status(200).json({
      result: {
        exists: true,
        brand: data.make,
        model: data.model,
        yearOfProduction: data.year,
      },
    });
  return res.status(200).json({
    result: {
      exists: false,
    },
  });
}
