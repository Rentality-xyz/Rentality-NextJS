import { z } from "zod";

export const carEditFormSchema = z.object({
  carId: z.number({
    required_error: "value is required",
    invalid_type_error: "value must be a number",
  }),

  vinNumber: z.string().min(1, "Vin number is too short").max(17, "Vin number is too long"),
  brand: z.string().min(1, "Brand is too short").max(30, "Brand is too long"),
  model: z.string().min(1, "Model is too short").max(30, "Model is too long"),
  releaseYear: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(1900, "Release year is too small")
    .max(2099, "Release year is too big")
    .int("Release year must be an integer"),

  image: z.string(),

  name: z.string().min(1, "Name is too short").max(15, "name is too long"),
  licensePlate: z.string().min(1, "License plate is too short").max(15, "License plate is too long"),
  licenseState: z.string().min(1, "License state is too short").max(50, "License state is too long"),
  engineTypeText: z.string(),

  seatsNumber: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(1, "Seats number is too small")
    .max(20, "Seats number is too big")
    .int("Seats number must be an integer"),
  doorsNumber: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(1, "Doors number is too small")
    .max(5, "Doors number is too big")
    .int("Doors number must be an integer"),
  tankVolumeInGal: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(0.01, "Volume is too small")
    .step(0.01, "only 2 decimals are allowed"),
  transmission: z.string(),
  color: z.string().min(1, "Color is too short").max(15, "Color is too long"),

  description: z.string().min(1, "Description is too short").max(500, "Description is too long"),

  isLocationEdited: z.boolean(),
  locationInfoAddress: z.string(),
  locationInfoCountry: z.string(),
  locationInfoState: z.string(),
  locationInfoCity: z.string(),
  locationInfoLatitude: z.number(),
  locationInfoLongitude: z.number(),
  locationInfoTimeZoneId: z.string(),

  milesIncludedPerDay: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .int("Value must be an integer"),

  pricePerDay: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .min(0.01, "value is too small")
    .max(100, "value is too big")
    .step(0.01, "only 2 decimals are allowed"),
  securityDeposit: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .max(100, "value is too big")
    .step(0.01, "only 2 decimals are allowed"),
  fuelPricePerGal: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .max(100, "value is too big")
    .step(0.01, "only 2 decimals are allowed"),
  fullBatteryChargePrice: z
    .number({
      required_error: "value is required",
      invalid_type_error: "value must be a number",
    })
    .max(100, "value is too big")
    .step(0.01, "only 2 decimals are allowed"),
  isInsuranceIncluded: z.boolean(),

  timeBufferBetweenTripsInMin: z.number(),
  currentlyListed: z.boolean(),
});

export type CarEditFormValues = z.infer<typeof carEditFormSchema>;
