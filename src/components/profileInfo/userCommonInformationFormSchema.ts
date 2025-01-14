import { z } from "zod";

const insuranceFileFormSchema = z.union([
  z.object({
    file: z.instanceof(File),
    localUrl: z.string(),
  }),
  z.object({
    url: z.string(),
    isDeleted: z.boolean().optional(),
  }),
]);

export const userCommonInformationFormSchema = z.object({
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
  userInsurancePhoto: insuranceFileFormSchema,
});

export type UserCommonInformationFormValues = z.infer<typeof userCommonInformationFormSchema>;
