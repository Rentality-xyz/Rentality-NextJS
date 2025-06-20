import { NextApiRequest, NextApiResponse } from "next";
import sendEmailVerificationCodeHandler from "@/features/profile/api/sendEmailVerificationCode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await sendEmailVerificationCodeHandler(req, res);
}
