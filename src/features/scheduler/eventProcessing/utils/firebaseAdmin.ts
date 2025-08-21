import { env } from "@/utils/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { logger } from "@/utils/logger";

function getApp() {
  const sa = JSON.parse(env.FB_SERVICE_ACCOUNT);
  const app = initializeApp({ credential: cert(sa) });
  logger.info("Firebase admin service account initialized successfully.");
  return app;
}

const app = getApps()[0] ?? getApp()
export const messaging = getMessaging(app);