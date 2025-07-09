import { Err, Ok, Result, UnknownErr } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from "firebase-admin/messaging";
import { RentalityEvent, UserInfo } from "@/features/scheduler/eventProcessing/models";
import { getPushTemplate, PushTemplate } from "@/features/scheduler/eventProcessing/utils/pushTemplates";
import { isEmpty } from "@/utils/string";
import { env } from "@/utils/env";

class FirebasePushService {

  constructor() {
    if (!getApps().length) {
      try {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({ credential: cert(serviceAccount) });
      } catch (error) {
        logger.error("Error initializing Firebase Push service account", error);
      }
    }

  }

  async processEvent(
    event: RentalityEvent,
    userFromInfo: UserInfo | null,
    userToInfo: UserInfo | null,
    baseUrl: string
  ): Promise<Result<boolean>> {
    try {

      const { fromTemplate, toTemplate } = getPushTemplate(event, baseUrl);

      if (fromTemplate && userFromInfo && !isEmpty(userFromInfo.pushToken)) {
        await this.sendPush(userFromInfo.pushToken, fromTemplate);
      }
      if (toTemplate && userToInfo && !isEmpty(userToInfo.pushToken)) {
        await this.sendPush(userToInfo.pushToken, toTemplate);
      }

      return Ok(true);
    } catch (error) {
      return UnknownErr(error);
    }
  }

  async sendPush(pushToken: string, template: PushTemplate): Promise<Result<boolean>> {
    try {
      const message = {
        notification: {
          title: template.title,
          body: template.body,
        },
        token: pushToken,
      };

      const response = await getMessaging().send(message)

      if (response) {
        logger.info("Push sent successfully:", response);
        return Ok(true);
      } else {
        return Err(new Error("Push was not sent"));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      logger.error("Push sending failed:", errorMessage);
      return Err(new Error(`Failed to send push: ${errorMessage}`));
    }
  }
}

export default FirebasePushService;