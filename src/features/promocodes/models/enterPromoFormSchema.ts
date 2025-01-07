import { z } from "zod";

export const enterPromoFormSchema = z.object({
  enteredPromo: z.string().trim().min(1, "Promo is too short"),
});

export type EnterPromoFormValues = z.infer<typeof enterPromoFormSchema>;
