import { z } from "zod";

const claimFileFormSchema = z.object({
  file: typeof File !== "undefined" ? z.instanceof(File) : z.any(),
  // file: z.instanceof(File),
  localUrl: z.string(),
});

export const createClaimFormSchema = z.object({
  selectedTripId: z.string(),
  incidentType: z.string().trim(),
  description: z.string().trim().min(1, "Description is too short").max(1000, "Description is too long"),
  amountInUsd: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(0.01, "Amount is too small")
    .max(50_000, "Amount is too big")
    .step(0.01, "only 2 decimals are allowed"),
  isChecked: z.boolean(),
  localFileUrls: z.array(claimFileFormSchema),
});

export type CreateClaimFormValues = z.infer<typeof createClaimFormSchema>;
