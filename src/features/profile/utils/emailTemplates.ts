import { EmailTemplate } from "@/features/scheduler/eventProcessing/utils/emailTemplates";

export function getEmailVerificationMessageTemplate(link: string): EmailTemplate {
  return {
    subject: "Verify your email address",
    html: `
    <div style="font-family: "Montserrat", Arial, sans-serif; line-height: 1.5;">
      <h2>Welcome, Rentality user!</h2>
      <p>Thank you for signing up on Rentality platform. Please verify your email address by clicking the button below:</p>
      <p>
        <a href="${link}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>If you did not create this account, you can safely ignore this email.</p>
    </div>
  `,
    text: `
    Welcome, Rentality user!

    Thank you for signing up on Rentality platform. Please verify your email address by clicking the link below:

    ${link}

    If you did not create this account, you can safely ignore this email.
  `,
  };
}
