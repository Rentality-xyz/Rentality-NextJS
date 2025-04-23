import type { NextApiRequest, NextApiResponse } from "next";
import aiAssessmentHandler from "@/features/motionsCloud/api/aiAssessment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  aiAssessmentHandler(req, res);
}
