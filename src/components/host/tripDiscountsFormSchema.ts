import { z } from "zod";

export const tripDiscountsFormSchema = z.object({
  discount3DaysAndMoreInPercents: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be an integer",
    })
    .min(1, "value is too small")
    .max(99, "value is too big")
    .int("value must be an integer"),
  discount7DaysAndMoreInPercents: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be an integer",
    })
    .min(1, "value is too small")
    .max(99, "value is too big")
    .int("value must be an integer"),
  discount30DaysAndMoreInPercents: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be an integer",
    })
    .min(1, "value is too small")
    .max(99, "value is too big")
    .int("value must be an integer"),
});

export type TripDiscountsFormValues = z.infer<typeof tripDiscountsFormSchema>;
