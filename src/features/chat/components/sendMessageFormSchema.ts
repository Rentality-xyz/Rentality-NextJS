import { z } from "zod";

export const sendMessageFormSchema = z.object({
  messageText: z.string().trim().min(1, "Message is too short").max(1000, "Message is too long"),
});

export type SendMessageFormValues = z.infer<typeof sendMessageFormSchema>;
