import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { LOG_LEVELS, NODE_ENVS } from "./constants";

export const env = createEnv({
  server: {
    NEXT_USE_STRICT_MODE: booleanEnvType().optional(),

    CIVIC_CLIENT_ID: z.string().optional(),
    CIVIC_CLIENT_SECRET: z.string().optional(),

    PLATFORM_USER_EMAIL: z.string().email(),
    PLATFORM_USER_PASSWORD: z.string(),

    SIGNER_PRIVATE_KEY: z.string(),
    MANAGER_PRIVATE_KEY: z.string(),
    ADMIN_VIEWER_PRIVATE_KEY: z.string(),

    PROVIDER_API_URL_1337: z.string().url().optional(),
    PROVIDER_API_URL_5611: z.string().url().optional(),
    PROVIDER_API_URL_8453: z.string().url(),
    PROVIDER_API_URL_84532: z.string().url(),
    PROVIDER_API_URL_11155111: z.string().url().optional(),
    PROVIDER_API_URL_11155420: z.string().url().optional(),

    INDEXER_URL_1337: z.string().url().optional(),
    INDEXER_URL_5611: z.string().url().optional(),
    INDEXER_URL_8453: z.string().url(),
    INDEXER_URL_84532: z.string().url(),
    INDEXER_URL_204: z.string().url(),
    INDEXER_URL_11155111: z.string().url().optional(),
    INDEXER_URL_11155420: z.string().url().optional(),

    CARAPI_TOKEN: z.string(),
    CARAPI_SECRET: z.string(),

    TEST_WALLETS_ADDRESSES: z.string(),
    GOOGLE_MAPS_API_KEY: z.string().min(1),

    PRIVY_VERIFICATION_KEY: z.string().min(1),

    API_AI_DAMAGE_ANALYZE_SECRET: z.string(),

    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    VERIFICATION_HMAC_SHA256_SECRET_KEY: z.string(),

    NOTIFICATION_SMTP_USER: z.string(),
    NOTIFICATION_SMTP_PASSWORD: z.string(),

    API_AUTH_TOKEN: z.string(),
    BASE_URL: z.string(),

    FB_SERVICE_ACCOUNT: z.string(),

  },
  client: {
    NEXT_PUBLIC_INCLUDE_MAINNETS: booleanEnvType(),
    NEXT_PUBLIC_INCLUDE_TESTNETS: booleanEnvType(),
    NEXT_PUBLIC_INCLUDE_LOCALNETS: booleanEnvType(),

    NEXT_PUBLIC_USER_EMAIL: z.string().email(),
    NEXT_PUBLIC_USER_PASSWORD: z.string(),

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
    NEXT_PUBLIC_USE_ERUDA_DEV_TOOLS: booleanEnvType().optional(),
    NEXT_PUBLIC_SKIP_KYC_PAYMENT: booleanEnvType().optional(),

    NEXT_PUBLIC_FB_PIXEL_ID: z.coerce.number(),

    NEXT_PUBLIC_IS_TECHNICAL_WORK: booleanEnvType(),

    NEXT_PUBLIC_SERVER_DIMO_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_SERVER_DIMO_API_KEY: z.string().min(1),
    NEXT_PUBLIC_SERVER_DIMO_DOMAIN: z.string().min(1),

    NEXT_PUBLIC_AI_DAMAGE_ANALYZE_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SID: z.string().min(1),
    NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SECRETKEY: z.string().min(1),

    NEXT_PUBLIC_NODE_ENV: unionOfLiterals(NODE_ENVS).default("development"),
    NEXT_PUBLIC_MIN_CONSOLE_LOG_LEVEL: unionOfLiterals(LOG_LEVELS).default("trace"),
    NEXT_PUBLIC_MIN_EXTERNAL_LOG_LEVEL: unionOfLiterals(LOG_LEVELS).default("info"),

    NEXT_PUBLIC_AKAVE_ENDPOINT: z.string().min(1),
    NEXT_PUBLIC_AKAVE_REGION: z.string().min(1),
    NEXT_PUBLIC_AKAVE_BUCKET: z.string().min(1),
    NEXT_PUBLIC_AKAVE_ACCESS_KEY_ID: z.string().min(1),
    NEXT_PUBLIC_AKAVE_SECRET_ACCESS_KEY: z.string().min(1),

    NEXT_PUBLIC_FILESTORE_NAME: z.string(),
  },

  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  experimental__runtimeEnv: {
    NEXT_PUBLIC_INCLUDE_MAINNETS: process.env.NEXT_PUBLIC_INCLUDE_MAINNETS,
    NEXT_PUBLIC_INCLUDE_TESTNETS: process.env.NEXT_PUBLIC_INCLUDE_TESTNETS,
    NEXT_PUBLIC_INCLUDE_LOCALNETS: process.env.NEXT_PUBLIC_INCLUDE_LOCALNETS,

    NEXT_PUBLIC_USER_EMAIL: process.env.NEXT_PUBLIC_USER_EMAIL,
    NEXT_PUBLIC_USER_PASSWORD: process.env.NEXT_PUBLIC_USER_PASSWORD,

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

    NEXT_PUBLIC_IS_TECHNICAL_WORK: process.env.NEXT_PUBLIC_IS_TECHNICAL_WORK,

    NEXT_PUBLIC_SERVER_DIMO_CLIENT_ID: process.env.NEXT_PUBLIC_SERVER_DIMO_CLIENT_ID,
    NEXT_PUBLIC_SERVER_DIMO_API_KEY: process.env.NEXT_PUBLIC_SERVER_DIMO_API_KEY,
    NEXT_PUBLIC_SERVER_DIMO_DOMAIN: process.env.NEXT_PUBLIC_SERVER_DIMO_DOMAIN,

    NEXT_PUBLIC_AI_DAMAGE_ANALYZE_BASE_URL: process.env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_BASE_URL,
    NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SID: process.env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SID,
    NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SECRETKEY: process.env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SECRETKEY,

    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_MIN_CONSOLE_LOG_LEVEL: process.env.NEXT_PUBLIC_MIN_CONSOLE_LOG_LEVEL,
    NEXT_PUBLIC_MIN_EXTERNAL_LOG_LEVEL: process.env.NEXT_PUBLIC_MIN_EXTERNAL_LOG_LEVEL,

    NEXT_PUBLIC_AKAVE_ENDPOINT: process.env.NEXT_PUBLIC_AKAVE_ENDPOINT,
    NEXT_PUBLIC_AKAVE_REGION: process.env.NEXT_PUBLIC_AKAVE_REGION,
    NEXT_PUBLIC_AKAVE_BUCKET: process.env.NEXT_PUBLIC_AKAVE_BUCKET,
    NEXT_PUBLIC_AKAVE_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_AKAVE_ACCESS_KEY_ID,
    NEXT_PUBLIC_AKAVE_SECRET_ACCESS_KEY: process.env.NEXT_PUBLIC_AKAVE_SECRET_ACCESS_KEY,

    NEXT_PUBLIC_FILESTORE_NAME: process.env.NEXT_PUBLIC_FILESTORE_NAME,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  //    experimental__runtimeEnv: {
  //      NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  //    }
});

function booleanEnvType() {
  return z.union([z.literal("true"), z.literal("false")], {
    message: "value should be 'true' or 'false'",
  });
}

function unionOfLiterals<T extends string>(constants: readonly T[]) {
  const literals = constants.map((x) => z.literal(x)) as unknown as readonly [
    z.ZodLiteral<T>,
    z.ZodLiteral<T>,
    ...z.ZodLiteral<T>[],
  ];

  return z.union(literals);
}
