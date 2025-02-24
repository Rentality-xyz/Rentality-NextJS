import { ONE_TIME_INSURANCE_TYPE_ID } from "@/utils/constants";
import { z } from "zod";

export const addTripInsuranceFormSchema = z.object({
  insuranceType: z.literal(ONE_TIME_INSURANCE_TYPE_ID),
  selectedTripId: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be an integer",
    })
    .int("value must be an integer"),
  companyName: z.string().default(""),
  policeNumber: z.string().default(""),
  comment: z.string().default(""),
});

export type AddTripInsuranceFormValues = z.infer<typeof addTripInsuranceFormSchema>;
