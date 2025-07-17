import { EmailTemplate } from "@/features/scheduler/eventProcessing/utils/emailTemplates";

export function getEmailVerificationMessageTemplate(link: string): EmailTemplate {
  return {
    subject: "Verify your email address",
    message: `
    Thank you for signing up on Rentality platform. Please verify your email address by clicking the button.

    If you did not create this account, you can safely ignore this email.
  `,
    actionText: "Verify",
    actionPath: link,
    baseUrl: ""
  };
}
