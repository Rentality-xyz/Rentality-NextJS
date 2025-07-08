import { NextApiRequest, NextApiResponse } from "next";
import checkEmailVerificationCodeHandler from "@/features/profile/api/checkEmailVerificationCode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  return await checkEmailVerificationCodeHandler(req, res, baseUrl);
}
