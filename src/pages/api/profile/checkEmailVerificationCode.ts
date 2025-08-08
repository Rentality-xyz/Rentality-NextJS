import { NextApiRequest, NextApiResponse } from "next";
import checkEmailVerificationCodeHandler from "@/features/profile/api/checkEmailVerificationCode";
import { env } from "process";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;

  const fallbackBaseUrl = `${protocol}://${host}`;
  const envBaseUrl = env.BASE_URL;

  const baseUrl = envBaseUrl && envBaseUrl.trim() !== ""
    ? envBaseUrl
    : fallbackBaseUrl;

  return await checkEmailVerificationCodeHandler(req, res, baseUrl);
}
