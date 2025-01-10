import { z } from "zod";

export const kycUserDataFormSchema = z.object({
  name: z.string(),
  documentType: z.string(),
  drivingLicenceNumber: z.string(),
  drivingLicenceValidityPeriod: z.date().optional(),
  issueCountry: z.string(),
  email: z.string(),
});

export type KycUserDataFormValues = z.infer<typeof kycUserDataFormSchema>;
