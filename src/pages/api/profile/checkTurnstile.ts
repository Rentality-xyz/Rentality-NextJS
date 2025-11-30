import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/utils/logger";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    logger.error("Turnstile verification: method not allowed");
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const { token } = req.body ?? {};

  if (typeof token !== "string" || !token.trim()) {
    logger.error("Turnstile verification: invalid params");
    res.status(400).json({ ok: false, error: "Invalid parameters" });
    return;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    logger.error("Turnstile verification: TURNSTILE_SECRET_KEY not configured");
    res.status(500).json({ ok: false, error: "Turnstile secret key is not configured" });
    return;
  }

  try {

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!verifyRes.ok) {
      logger.error(`Turnstile verification: siteverify HTTP error ${verifyRes.status}`);
      res.status(502).json({ ok: false, error: "Turnstile verification service error" });
      return;
    }

    const data = (await verifyRes.json()) as TurnstileVerifyResponse;

    if (!data.success) {
      logger.error("Turnstile verification: failed", {
        errorCodes: data["error-codes"],
        actionFromApi: data.action,
      });

      res.status(200).json({
        ok: false,
        error: "Turnstile verification failed",
        errorCodes: data["error-codes"] ?? [],
      });
      return;
    }

    res.status(200).json({
      ok: true,
      isVerified: true,
    });
  } catch (err: any) {
    logger.error("Turnstile verification: unhandled error", err);
    res.status(500).json({ ok: false, error: "Internal error" });
  }
}
