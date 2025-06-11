import { Err, Ok, Result, UnknownErr } from "@/model/utils/result";
import { RentalityEvent, UserInfo } from "../models";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/string";
import nodemailer from "nodemailer";
import { logger } from "@/utils/logger";
import { EmailTemplate, getEmailTemplate } from "./emailTemplates";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.NOTIFICATION_SMTP_USER,
        pass: env.NOTIFICATION_SMTP_PASSWORD,
      },
    });
  }

  async processEvent(
    event: RentalityEvent,
    userFromInfo: UserInfo | null,
    userToInfo: UserInfo | null,
    baseUrl: string
  ): Promise<Result<boolean>> {
    try {
      const fromEmail = env.NOTIFICATION_SMTP_USER;
      if (isEmpty(fromEmail)) {
        return Err(new Error("NOTIFICATION_EMAIL_USER was not set"));
      }

      const { fromTemplate, toTemplate } = getEmailTemplate(event, baseUrl);

      if (fromTemplate && userFromInfo && userFromInfo.isEmailVerified) {
        await this.sendEmail(userFromInfo.email, fromTemplate);
      }
      if (
        toTemplate &&
        userToInfo &&
        userToInfo.isEmailVerified &&
        (userFromInfo === null || userToInfo.email.toLowerCase() !== userFromInfo.email.toLowerCase())
      ) {
        await this.sendEmail(userToInfo.email, toTemplate);
      }

      return Ok(true);
    } catch (error) {
      return UnknownErr(error);
    }
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<Result<boolean>> {
    try {
      if (!env.NOTIFICATION_SMTP_USER || !env.NOTIFICATION_SMTP_PASSWORD) {
        return Err(
          new Error("Gmail credentials not configured. Please set GMAIL_USER and GMAIL_PASSWORD environment variables.")
        );
      }

      await this.transporter.verify();

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (info.messageId) {
        logger.info("Email sent successfully:", info.messageId);
        return Ok(true);
      } else {
        return Err(new Error("Email was not sent - no message ID returned"));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      logger.error("Email sending failed:", errorMessage);
      return Err(new Error(`Failed to send email: ${errorMessage}`));
    }
  }
}

export default EmailService;
