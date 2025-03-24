import { MAX_VIN_LENGTH } from "@/components/common/rntVINCheckingInput";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING } from "@/model/EngineType";
import { UNLIMITED_MILES_VALUE_TEXT } from "@/model/HostCarInfo";
import { emptyLocationInfo } from "@/model/LocationInfo";
import { TRANSMISSION_AUTOMATIC_STRING, TRANSMISSION_MANUAL_STRING } from "@/model/Transmission";
import { z } from "zod";

const carFileFormSchema = z.union([
  z.object({
    // file: typeof window !== "undefined" ? z.instanceof(File) : z.any(), //TODO
    file: z.instanceof(File),
    localUrl: z.string(),
    isPrimary: z.boolean(),
  }),
  z.object({
    url: z.string(),
    isDeleted: z.boolean().optional(),
    isPrimary: z.boolean(),
  }),
]);

const insuranceFormSchema = z
  .union([
    z.object({
      isGuestInsuranceRequired: z.literal(false),
      insurancePerDayPriceInUsd: z
        .number({
          required_error: "Value is required",
          invalid_type_error: "value must be a number",
        })
        .optional(),
    }),
    z.object({
      isGuestInsuranceRequired: z.literal(true),
      insurancePerDayPriceInUsd: z
        .number({
          required_error: "Value is required",
          invalid_type_error: "value must be a number",
        })
        .min(1, "Price is too small")
        .max(10_000, "Price is too big")
        .step(0.01, "only 2 decimals are allowed"),
    }),
  ])
  .default({ isGuestInsuranceRequired: false });

const locationInfoFormSchema = z.object({
  address: z.string().trim().min(1, "Address is too short"),
  country: z.string().trim().min(1, "Country is too small"),
  state: z.string().trim().min(1, "State is too small"),
  city: z.string().trim().min(1, "City is too small"),
  latitude: z
    .number({
      required_error: "Latitude is required",
      invalid_type_error: "Latitude must be a number",
    })
    .min(-90, "Latitude is too small")
    .max(90, "Latitude is too big")
    .step(0.000001, "only 6 decimals are allowed"),
  longitude: z
    .number({
      required_error: "Longitude is required",
      invalid_type_error: "Longitude must be a number",
    })
    .min(-180, "Longitude is too small")
    .max(180, "Longitude is too big")
    .step(0.000001, "only 6 decimals are allowed"),
  timeZoneId: z.string().trim(),
});

export const vinNumberSchema = z
  .string()
  .toUpperCase()
  .min(1, "Vin number is too short")
  .max(MAX_VIN_LENGTH, "Vin number is too long")
  .regex(new RegExp(/^[A-HJ-NPR-Z0-9]*$/), "Vin number contains invalid characters");

const defaultCarEditFormSchema = z
  .object({
    carId: z
      .number({
        required_error: "carId is required",
        invalid_type_error: "carId must be a number",
      })
      .optional(),

    vinNumber: vinNumberSchema,
    brand: z.string().trim().min(1, "Brand is too short").max(30, "Brand is too long"),
    model: z.string().trim().min(1, "Model is too short").max(30, "Model is too long"),
    releaseYear: z
      .number({
        required_error: "Release year is required",
        invalid_type_error: "Release year must be a number",
      })
      .min(1900, "Release year is too small")
      .max(2100, "Release year is too big")
      .int("Release year must be an integer"),

    images: z.array(carFileFormSchema).min(1, "Please upload an image"),

    name: z.string().trim().min(1, "Name is too short").max(25, "Name is too long"),
    licensePlate: z.string().trim().min(1, "License plate is too short").max(15, "License plate is too long"),
    licenseState: z.string().trim().min(1, "License state is too short").max(50, "License state is too long"),
    engineTypeText: z.union([z.literal(ENGINE_TYPE_PETROL_STRING), z.literal(ENGINE_TYPE_ELECTRIC_STRING)]),
    seatsNumber: z
      .number({
        required_error: "Seats number is required",
        invalid_type_error: "Seats number must be a number",
      })
      .min(1, "Seats number is too small")
      .max(20, "Seats number is too big")
      .int("Seats number must be an integer"),
    doorsNumber: z
      .number({
        required_error: "Doors number is required",
        invalid_type_error: "Doors number must be a number",
      })
      .min(1, "Doors number is too small")
      .max(5, "Doors number is too big")
      .int("Doors number must be an integer"),
    transmission: z.union([z.literal(TRANSMISSION_MANUAL_STRING), z.literal(TRANSMISSION_AUTOMATIC_STRING)]),
    color: z
      .string()
      .trim()
      .min(1, "Color is too short")
      .max(15, "Color is too long")
      .regex(new RegExp(/^[\w- ]+$/), "Color contains invalid characters"),

    description: z.string().trim().min(1, "Description is too short").max(500, "Description is too long"),

    isLocationEdited: z.boolean().default(true),
    locationInfo: locationInfoFormSchema.default(emptyLocationInfo),
    milesIncludedPerDay: z
      .number({
        required_error: "Miles included is required",
        invalid_type_error: "Miles included must be a number",
      })
      .min(1, "Miles included is too small")
      .max(700, "Miles included is too big")
      .int("Miles included must be an integer")
      .or(z.literal(UNLIMITED_MILES_VALUE_TEXT)),

    pricePerDay: z
      .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
      })
      .min(1, "Price is too small")
      .max(10_000, "Price is too big")
      .step(0.01, "only 2 decimals are allowed"),
    dimoTokenId: z.number({
      required_error: "DIMO token ID is required",
      invalid_type_error: "DIMO token ID must be a number",
    }),

    securityDeposit: z
      .number({
        required_error: "Deposit is required",
        invalid_type_error: "Deposit must be a number",
      })
      .min(1, "Deposit is too small")
      .max(100_000, "Deposit is too big")
      .step(0.01, "only 2 decimals are allowed"),
    timeBufferBetweenTripsInMin: z
      .number({
        required_error: "Value is required",
        invalid_type_error: "Value must be a number",
      })
      .default(0),
    currentlyListed: z.boolean().default(true),
  })
  .and(insuranceFormSchema);

const petrolCarSchema = z.object({
  engineTypeText: z.literal(ENGINE_TYPE_PETROL_STRING),
  tankVolumeInGal: z
    .number({
      required_error: "Tank volume is required",
      invalid_type_error: "Tank volume must be a number",
    })
    .min(0.01, "Volume is too small")
    .step(0.01, "only 2 decimals are allowed"),
  fuelPricePerGal: z
    .number({
      required_error: "Fuel price is required",
      invalid_type_error: "Fuel price must be a number",
    })
    .min(1, "Fuel price is too small")
    .max(50, "Fuel price is too big")
    .step(0.01, "only 2 decimals are allowed"),
});

const electricCarSchema = z.object({
  engineTypeText: z.literal(ENGINE_TYPE_ELECTRIC_STRING),
  fullBatteryChargePrice: z
    .number({
      required_error: "Battery charge price is required",
      invalid_type_error: "Battery charge price must be a number",
    })
    .min(1, "value is too small")
    .max(100, "value is too big")
    .step(0.01, "only 2 decimals are allowed"),
});

const schemaCond = z.discriminatedUnion("engineTypeText", [petrolCarSchema, electricCarSchema]);

export const carEditFormSchema = z.intersection(schemaCond, defaultCarEditFormSchema);

export type CarEditFormValues = z.infer<typeof carEditFormSchema>;
