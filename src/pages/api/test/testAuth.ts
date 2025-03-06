import { checkRentalityAuthToken } from "@/features/auth/utils/serverAuth";
import { logger } from "@/utils/logger";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = await checkRentalityAuthToken(req);

  if (!authResult.ok) {
    logger.error("testAuth error: ", authResult.error.message);
    res.status(authResult.error.statusCode).json({
      error:
        authResult.error.statusCode !== 500
          ? authResult.error.message
          : "Something went wrong! Please wait a few minutes and try again",
    });
    return;
  }

  res.status(200).json({ ok: true });
  return;
}
