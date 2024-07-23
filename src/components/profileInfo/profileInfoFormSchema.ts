import moment from "moment";
import { z } from "zod";

export const profileInfoFormSchema = z.object({
  profilePhotoUrl: z.string(),
  firstName: z
    .string()
    .min(1, "first name is too short")
    .max(30, "first name is too long")
    .regex(new RegExp(/^[\w-]+$/), "first name contains invalid characters"),
  lastName: z
    .string()
    .min(1, "last name is too short")
    .max(30, "last name is too long")
    .regex(new RegExp(/^[\w-]+$/), "last name contains invalid characters"),
  phoneNumber: z.string().max(30, "phone number is too long"),
  drivingLicenseNumber: z.string().max(15, "License number is too long"),
  drivingLicenseExpire: z
    .date({
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === "invalid_date" ? "Please enter date in format mm/dd/year" : defaultError,
      }),
    })
    .max(moment().add(15, "y").toDate(), "A maximum of 15 years in the future")
    .or(z.undefined()),
  //.refine((data) => !isNaN(data?.getTime() ?? 0), { message: "Please enter date in format mm/dd/year" }),
  tcSignature: z.string(),
});

export type ProfileInfoFormValues = z.infer<typeof profileInfoFormSchema>;
