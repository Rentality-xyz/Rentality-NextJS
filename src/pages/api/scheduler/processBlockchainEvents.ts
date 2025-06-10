import type { NextApiRequest, NextApiResponse } from "next";
import processBlockchainEventsHandler from "@/features/scheduler/eventProcessing/api/processBlockchainEvents";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await processBlockchainEventsHandler(req, res);
}
