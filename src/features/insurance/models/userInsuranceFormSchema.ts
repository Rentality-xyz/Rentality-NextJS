import { z } from "zod";

const fileFormSchema = z.union([
  z.object({
    // file: typeof window !== "undefined" ? z.instanceof(File) : z.any(),
    file: z.instanceof(File),
    localUrl: z.string(),
  }),
  z.object({
    url: z.string(),
    isDeleted: z.boolean().optional(),
  }),
]);

export const userInsuranceFormSchema = z.object({
  userInsurancePhoto: fileFormSchema,
});

export type UserInsuranceFormValues = z.infer<typeof userInsuranceFormSchema>;
