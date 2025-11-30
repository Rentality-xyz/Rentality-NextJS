import twilio from "twilio";
import { env } from "@/utils/env";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { isEmpty } from "@/utils/string";
import { logger } from "@/utils/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    logger.error(`sendSmsVerificationCode error: method not allowed`);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber || typeof phoneNumber !== "string") {
    logger.error(`sendSmsVerificationCode error: invalid phone number`);
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }

  const TWILIO_ACCOUNT_SID = env.TWILIO_ACCOUNT_SID;
  if (isEmpty(TWILIO_ACCOUNT_SID)) {
    logger.error("sendSmsVerificationCode error: twilio account sid was not set");
    res.status(500).json({ error: "Twilio account sid was not set" });
    return;
  }

  const TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN;
  if (isEmpty(TWILIO_AUTH_TOKEN)) {
    logger.error("sendSmsVerificationCode error: twilio auth token was not set");
    res.status(500).json({ error: "Twilio auth token was not set" });
    return;
  }

  const VERIFICATION_HMAC_SHA256_SECRET_KEY = env.VERIFICATION_HMAC_SHA256_SECRET_KEY;
  if (isEmpty(VERIFICATION_HMAC_SHA256_SECRET_KEY)) {
    logger.error("sendSmsVerificationCode error: SHA256 secret key was not set");
    res.status(500).json({ error: "SHA256 secret key was not set" });
    return;
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const timestamp = Date.now();

  const hash = crypto
    .createHmac("sha256", VERIFICATION_HMAC_SHA256_SECRET_KEY)
    .update(phoneNumber + verificationCode + timestamp)
    .digest("hex");

  try {
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phoneNumber}`,
      contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
      contentVariables: `{"1":"${verificationCode}"}`,
    });
    logger.info("Sms verification code sent successfully");
    res.status(200).json({ hash, timestamp });
    return;
  } catch (error) {
    logger.error(`sendSmsVerificationCode error: failed to send message ${error}`);
    res.status(500).json({ error: "Failed to send message" });
    return;
  }
}
