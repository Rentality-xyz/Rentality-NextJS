import { z } from "zod";

export const changeStatusHostConfirmedFormSchema = z.object({
  fuelOrBatteryLevel: z
    .number({
      required_error: "value is required",
      invalid_type_error: "Level must be a number",
    })
    .min(0, "Level should be positive")
    .max(1, "Level is to big")
    .step(0.1),
  odotemer: z
    .number({
      required_error: "Odotemer is required",
      invalid_type_error: "Odotemer must be a number",
    })
    .min(0, "Odotemer should be positive")
    .max(9999999, "Level is to big")
    .int(),
  insuranceCompanyName: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

export type ChangeStatusHostConfirmedFormValues = z.infer<typeof changeStatusHostConfirmedFormSchema>;
