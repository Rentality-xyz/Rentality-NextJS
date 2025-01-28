import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const ffName = <string>req.query.name;

  if(ffName == undefined || ffName == "" || !ffName.startsWith("FF_")) {
    return res.status(404).send("Not found");
  }

  return res.status(200).json(process.env[ffName]);
}