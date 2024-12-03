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

export const addGuestInsuranceFormSchema = z.object({
  insuranceType: z.string().trim().min(1, "Type is not selected"),
  photos: insuranceFileFormSchema.optional(),
  selectedTripId: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be an integer",
    })
    .int("value must be an integer")
    .optional(),
  companyName: z.string().optional(),
  policeNumber: z.string().optional(),
  comment: z.string().optional(),
});

export type AddGuestInsuranceFormValues = z.infer<typeof addGuestInsuranceFormSchema>;
