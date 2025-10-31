import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Err, Ok, Result } from "@/model/utils/result";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { GetPhotosForTripResponseType } from "@/features/filestore";
import { getFileURIFromAkave } from "@/features/filestore/akave/utils";

// // ====== CONFIG ======
// const AKAVE_ENDPOINT = env.NEXT_PUBLIC_AKAVE_ENDPOINT ?? "https://o3-rc3.akave.xyz";
// const AKAVE_REGION = env.NEXT_PUBLIC_AKAVE_REGION ?? "akave-network";
// const AKAVE_BUCKET = env.NEXT_PUBLIC_AKAVE_BUCKET ?? "rentality-test-bucket";
// const AKAVE_ACCESS_KEY_ID = env.NEXT_PUBLIC_AKAVE_ACCESS_KEY_ID!;
// const AKAVE_SECRET_ACCESS_KEY = env.NEXT_PUBLIC_AKAVE_SECRET_ACCESS_KEY!;
// const AKAVE_PUBLIC_BASE_URL =
//   env.NEXT_PUBLIC_AKAVE_PUBLIC_BASE_URL ?? `https://o3-rc3.akave.xyz/${AKAVE_BUCKET}/`;



const s3 = new S3Client({
  region: AKAVE_REGION,
  endpoint: AKAVE_ENDPOINT,
  credentials: {
    accessKeyId: AKAVE_ACCESS_KEY_ID,
    secretAccessKey: AKAVE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

type S3ListResp = {
  Contents?: Array<{ Key?: string }>;
  IsTruncated?: boolean;
  NextContinuationToken?: string;
};

export type UploadedUrl = { url: string };

async function toByteBody(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

function buildTripKeyPrefix(tripId: number): string {
  return `trips_${tripId}_`;
}

function buildTripFileKey(params: {
  tripId: number;
  tripStatus: "start" | "end";
  uploadedBy: "host" | "guest";
  fileName: string;
}): string {
  const { tripId, tripStatus, uploadedBy, fileName } = params;
  return `trips_${tripId}_${tripStatus}_${uploadedBy}_${fileName}`;
}

function mapTripStatusFromKeySegment(seg: string): "start" | "end" | null {
  if (seg === "start") return "start";
  if (seg === "end") return "end";
  return null;
}

function mapUploadedByFromKeySegment(seg: string): "host" | "guest" | null {
  if (seg === "host") return "host";
  if (seg === "guest") return "guest";
  return null;
}

export async function getTripCarPhotosFromAkave(
  tripId: number
): Promise<GetPhotosForTripResponseType> {
  const prefix = buildTripKeyPrefix(tripId);
  const result: GetPhotosForTripResponseType = {
    checkInByHost: [],
    checkInByGuest: [],
    checkOutByGuest: [],
    checkOutByHost: [],
  };
  let ContinuationToken: string | undefined = undefined;

  do {
    const resp = (await s3.send(
      new ListObjectsV2Command({
        Bucket: AKAVE_BUCKET,
        Prefix: prefix,
        ContinuationToken,
        MaxKeys: 1000,
      })
    )) as S3ListResp;

    (resp.Contents ?? []).forEach((obj) => {
      const key = obj.Key!;
      const parts = key.split("_");
      if (parts.length < 5) return;

      const tripStatus = mapTripStatusFromKeySegment(parts[2]);
      const uploadedBy = mapUploadedByFromKeySegment(parts[3]);
      if (!tripStatus || !uploadedBy) return;

      const url = getFileURIFromAkave(key);
      const isStart = tripStatus === "start";
      const isHost = uploadedBy === "host";

      if (isHost) {
        if (isStart) result.checkInByHost.push(url);
        else result.checkOutByHost.push(url);
      } else {
        if (isStart) result.checkInByGuest.push(url);
        else result.checkOutByGuest.push(url);
      }
    });

    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);

  return result;
}

export async function uploadFileToAkave(
  file: File,
  fileName: string,
  keyValues?: Record<string, unknown>
): Promise<Result<UploadedUrl>> {
  console.log("uploadFileToAkave", file, keyValues);
  try {
    const kv = keyValues ?? {};
    const tripId =
      typeof kv.tripId === "number" ? kv.tripId :
        typeof kv.tripId === "string" ? Number(kv.tripId) : undefined;
    const tripStatus = typeof kv.tripStatus === "string" && (kv.tripStatus === "start" || kv.tripStatus === "end")
      ? (kv.tripStatus as "start" | "end")
      : undefined;
    const uploadedBy = typeof kv.uploadedBy === "string" && (kv.uploadedBy === "host" || kv.uploadedBy === "guest")
      ? (kv.uploadedBy as "host" | "guest")
      : undefined;

    const key = tripId && tripStatus && uploadedBy
      ? buildTripFileKey({ tripId, tripStatus, uploadedBy, fileName })
      : `${fileName}`;

    const ContentType = file.type || "application/octet-stream";
    const Metadata: Record<string, string> = {};
    for (const [k, v] of Object.entries(kv)) {
      if (v === undefined || v === null) continue;
      Metadata[k.toLowerCase()] = String(v);
    }

    const Body = await toByteBody(file);
    console.log("goooo")
    await s3.send(
      new PutObjectCommand({
        Bucket: AKAVE_BUCKET,
        Key: key,
        Body,
        ContentType,
        ContentDisposition: "inline",
        Metadata,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
      console.log("goooo222")
    const url = getFileURIFromAkave(key);
      console.log(url)
    logger.debug("File uploaded successfully to Akave: ", url);
    return Ok({ url });
  } catch (error: any) {
    console.log("File akave error:",error);
    logger.error(error);
    return error instanceof Error ? Err(error) : Err(new Error(String(error)));
  }
}


export async function deleteFileFromAkave(keyOrUrl: string): Promise<Result<boolean>> {
  try {
    const key = keyOrUrl.startsWith("http")
      ? decodeURI(keyOrUrl.replace(AKAVE_PUBLIC_BASE_URL, ""))
      : keyOrUrl;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: AKAVE_BUCKET,
        Key: key,
      })
    );

    logger.debug(`file ${key} deleted from Akave`);
    return Ok(true);
  } catch (error: any) {
    logger.error(error);
    return error instanceof Error ? Err(error) : Err(new Error(String(error)));
  }
}

export async function uploadJSONToAkave(
  jsonBody: unknown,
  fileName: string,
  keyValues?: Record<string, unknown>
): Promise<Result<UploadedUrl>> {
  try {
    const kv = keyValues ?? {};
    const tripId =
      typeof kv.tripId === "number" ? kv.tripId :
        typeof kv.tripId === "string" ? Number(kv.tripId) : undefined;
    const tripStatus = typeof kv.tripStatus === "string" && (kv.tripStatus === "start" || kv.tripStatus === "end")
      ? (kv.tripStatus as "start" | "end")
      : undefined;
    const uploadedBy = typeof kv.uploadedBy === "string" && (kv.uploadedBy === "host" || kv.uploadedBy === "guest")
      ? (kv.uploadedBy as "host" | "guest")
      : undefined;

    const key = tripId && tripStatus && uploadedBy
      ? buildTripFileKey({ tripId, tripStatus, uploadedBy, fileName })
      : `${fileName}`;

    const Metadata: Record<string, string> = {};
    for (const [k, v] of Object.entries(kv)) {
      if (v === undefined || v === null) continue;
      Metadata[k.toLowerCase()] = String(v);
    }

    const body = Buffer.from(JSON.stringify(jsonBody));

    await s3.send(
      new PutObjectCommand({
        Bucket: AKAVE_BUCKET,
        Key: key,
        Body: body,
        ContentType: "application/json",
        ContentDisposition: "inline",
        Metadata,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const url = getFileURIFromAkave(key);
    logger.debug("JSON uploaded successfully to Akave: ", url);
    return Ok({ url });
  } catch (error: any) {
    logger.error(error);
    return error instanceof Error ? Err(error) : Err(new Error(String(error)));
  }
}

