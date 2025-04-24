import analyzeDamagesHandler from "@/features/motionsCloud/api/analyzeDamages";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  analyzeDamagesHandler(req, res);
}
