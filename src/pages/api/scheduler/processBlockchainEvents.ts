import type { NextApiRequest, NextApiResponse } from "next";
import processBlockchainEventsHandler from "@/features/scheduler/eventProcessing/api/processBlockchainEvents";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  return await processBlockchainEventsHandler(req, res, baseUrl);
}
