import { z } from "zod";

export const profileInfoFormSchema = z.object({
  profilePhotoUrl: z.string(),
  nickname: z
    .string()
    .trim()
    .min(1, "first name is too short")
    .max(30, "first name is too long")
    .regex(new RegExp(/^[\w-]+$/), "nickname contains invalid characters"),
  phoneNumber: z.string().max(30, "phone number is too long"),
  isTerms: z.boolean(),
  tcSignature: z.string(),
  reflink: z.string(),
});

export type ProfileInfoFormValues = z.infer<typeof profileInfoFormSchema>;
