import { NextApiRequest, NextApiResponse } from "next";
import sendEmailVerificationCodeHandler from "@/features/profile/api/sendEmailVerificationCode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const checkUrlBase = `${baseUrl}/api/checkEmailVerificationCode`;

  return await sendEmailVerificationCodeHandler(req, res, checkUrlBase);
}
