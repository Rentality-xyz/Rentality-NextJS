import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const booleanEnvType = z.union([z.literal("true"), z.literal("false")], {
  message: "value should be 'true' or 'false'",
});

export const env = createEnv({
  server: {
    NEXT_USE_STRICT_MODE: booleanEnvType.optional(),

    CIVIC_CLIENT_ID: z.string().optional(),
    CIVIC_CLIENT_SECRET: z.string().optional(),
    CIVIC_USER_EMAIL: z.string().email().optional(),
    CIVIC_USER_PASSWORD: z.string().optional(),

    SIGNER_PRIVATE_KEY: z.string(),
    MANAGER_PRIVATE_KEY: z.string(),

    PROVIDER_API_URL_1337: z.string().url().optional(),
    PROVIDER_API_URL_5611: z.string().url().optional(),
    PROVIDER_API_URL_8453: z.string().url(),
    PROVIDER_API_URL_84532: z.string().url(),
    PROVIDER_API_URL_11155111: z.string().url().optional(),
    PROVIDER_API_URL_11155420: z.string().url().optional(),

    CARAPI_TOKEN: z.string(),
    CARAPI_SECRET: z.string(),

    TEST_WALLETS_ADDRESSES: z.string(),
    GOOGLE_MAPS_API_KEY: z.string().min(1),

    PRIVY_VERIFICATION_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_INCLUDE_MAINNETS: booleanEnvType,
    NEXT_PUBLIC_INCLUDE_TESTNETS: booleanEnvType,
    NEXT_PUBLIC_INCLUDE_LOCALNETS: booleanEnvType,

    NEXT_PUBLIC_DEFAULT_CHAIN_ID: z.coerce.number().positive(),

    NEXT_PUBLIC_PINATA_JWT: z.string().min(1),
    NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),
    NEXT_PUBLIC_CIVIC_GATEKEEPER_NETWORK: z.string().min(1),
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),

    NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string(),

    NEXT_PUBLIC_COINBASE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_COINBASE_SCHEMA_ID: z.string().startsWith("0x"),

    NEXT_PUBLIC_HOTJAR_SITE_ID: z.coerce.number(),
    NEXT_PUBLIC_HOTJAR_VERSION: z.coerce.number(),
    NEXT_PUBLIC_USE_ERUDA_DEV_TOOLS: booleanEnvType.optional(),
    NEXT_PUBLIC_SKIP_KYC_PAYMENT: booleanEnvType.optional(),

    NEXT_PUBLIC_FB_PIXEL_ID: z.coerce.number(),
  },

  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  experimental__runtimeEnv: {
    NEXT_PUBLIC_INCLUDE_MAINNETS: process.env.NEXT_PUBLIC_INCLUDE_MAINNETS,
    NEXT_PUBLIC_INCLUDE_TESTNETS: process.env.NEXT_PUBLIC_INCLUDE_TESTNETS,
    NEXT_PUBLIC_INCLUDE_LOCALNETS: process.env.NEXT_PUBLIC_INCLUDE_LOCALNETS,

    NEXT_PUBLIC_DEFAULT_CHAIN_ID: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,

    NEXT_PUBLIC_PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_CIVIC_GATEKEEPER_NETWORK: process.env.NEXT_PUBLIC_CIVIC_GATEKEEPER_NETWORK,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,

    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

    NEXT_PUBLIC_COINBASE_API_KEY: process.env.NEXT_PUBLIC_COINBASE_API_KEY,
    NEXT_PUBLIC_COINBASE_SCHEMA_ID: process.env.NEXT_PUBLIC_COINBASE_SCHEMA_ID,

    NEXT_PUBLIC_HOTJAR_SITE_ID: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID,
    NEXT_PUBLIC_HOTJAR_VERSION: process.env.NEXT_PUBLIC_HOTJAR_VERSION,
    NEXT_PUBLIC_USE_ERUDA_DEV_TOOLS: process.env.NEXT_PUBLIC_USE_ERUDA_DEV_TOOLS,
    NEXT_PUBLIC_SKIP_KYC_PAYMENT: process.env.NEXT_PUBLIC_SKIP_KYC_PAYMENT,

    NEXT_PUBLIC_FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  //    experimental__runtimeEnv: {
  //      NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  //    }
});
