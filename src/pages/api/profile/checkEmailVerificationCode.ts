import { NextApiRequest, NextApiResponse } from "next";
import checkEmailVerificationCodeHandler from "@/features/profile/api/checkEmailVerificationCode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await checkEmailVerificationCodeHandler(req, res);
}
