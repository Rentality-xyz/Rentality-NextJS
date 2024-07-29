import { z } from "zod";

export const deliveryPricesFormSchema = z.object({
  from1To25milesPrice: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(0.01, "value is too small")
    .max(100, "value is too big")
    .step(0.01, "only 2 decimals are allowed"),
  over25MilesPrice: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(0.01, "value is too small")
    .max(100, "value is too big")
    .step(0.01, "only 2 decimals are allowed"),
});

export type DeliveryPricesFormValues = z.infer<typeof deliveryPricesFormSchema>;
