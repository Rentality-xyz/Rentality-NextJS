import { env } from "@/utils/env";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { isEmpty } from "@/utils/string";
import { logger } from "@/utils/logger";

export default async function sendEmailVerificationCodeHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    logger.error(`sendEmailVerificationCode error: method not allowed`);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { userAddress, chainId } = req.body;

  //TODO: get email from blockchain
  if (!email || typeof email !== "string") {
    logger.error(`sendEmailVerificationCode error: invalid phone number`);
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  const VERIFICATION_HMAC_SHA256_SECRET_KEY = env.VERIFICATION_HMAC_SHA256_SECRET_KEY;
  if (isEmpty(VERIFICATION_HMAC_SHA256_SECRET_KEY)) {
    logger.error("sendEmailVerificationCode error: SHA256 secret key was not set");
    res.status(500).json({ error: "SHA256 secret key was not set" });
    return;
  }

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const timestamp = Date.now();

  const hash = crypto
    .createHmac("sha256", VERIFICATION_HMAC_SHA256_SECRET_KEY)
    .update(userAddress + email + verificationCode.toString() + timestamp.toString() + chainId.toString())
    .digest("hex");

  try {
    //TODO send email
    logger.info("Email verification code sent successfully");
    res.status(200).json({ hash, timestamp });
    return;
  } catch (error) {
    logger.error(`sendEmailVerificationCode error: failed to send message ${error}`);
    res.status(500).json({ error: "Failed to send message" });
    return;
  }
}
