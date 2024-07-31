import { z } from "zod";

export const changeStatusGuestStartedFormSchema = z
  .object({
    fuelOrBatteryLevelStart: z.string(),
    odotemerStart: z
      .number({
        required_error: "Odotemer is required",
        invalid_type_error: "Odotemer must be a number",
      })
      .min(0, "Odotemer should be positive")
      .max(9999999, "Level is to big")
      .int(),
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
  })
  .refine((data) => data.odotemer >= data.odotemerStart, {
    path: ["odotemer"],
    message: "Please enter value greater than at start trip",
  });

export type ChangeStatusGuestStartedFormValues = z.infer<typeof changeStatusGuestStartedFormSchema>;
