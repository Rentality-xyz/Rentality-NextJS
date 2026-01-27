import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityAiDamageAnalyzeContract } from "@/features/blockchain/models/IRentalityAiDamageAnalyze";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { deleteFileByUrl, saveAiAssessment } from "@/features/filestore/pinata/utils";
import { isEmpty } from "@/utils/string";
import { parseAiDamageAnalyzeCaseNumber } from "../utils";

export default async function aiAssessmentHandler(req: NextApiRequest, res: NextApiResponse) {
  let uploadedFileUrl: string = "";

  try {
    const token = req.headers["x-authorization"] as string | undefined;
    if (!token) {
      logger.error("API aiAssessment error: x-athorization token is missing");
      return res.status(401).json({ error: "x-athorization token is missing" });
    }
    if (!verifyXAuthorization(token)) {
      logger.error("API aiAssessments error: x-athorization token is incorrect");
      return res.status(401).json({ error: "x-athorization token is incorrect" });
    }

    const jsonData = req.body;
    const case_number = jsonData.data.case_number;

    logger.info(`\nCalling aiAssessment API with params: 'case_number'=${case_number}`);

    const { chainId } = parseAiDamageAnalyzeCaseNumber(case_number);
    if (!chainId) {
      logger.error("API aiAssessment error: chain id was not set");
      return;
    }
    const providerApiUrl = getProviderApiUrlFromEnv(chainId);

    if (!providerApiUrl) {
      logger.error(`API aiAssessments error: API URL for chain id ${chainId} was not set`);
      res.status(500).json({ error: `API aiAssessments error: API URL for chain id ${chainId} was not set` });
      return;
    }
    const MANAGER_PRIVATE_KEY = env.MANAGER_PRIVATE_KEY;

    if (!MANAGER_PRIVATE_KEY) {
      logger.error("API aiAssesments error: private key was not set");
      res.status(500).json({ error: "private key was not set" });
      return;
    }
    const provider = new JsonRpcProvider(providerApiUrl);
    const wallet = new Wallet(MANAGER_PRIVATE_KEY, provider);
    const rentality = (await getEtherContractWithSigner(
      "aiDamageAnalyze",
      wallet
    )) as unknown as IRentalityAiDamageAnalyzeContract;

    const caseExists = await rentality.isCaseTokenExists(jsonData.case_token);

    if (!caseExists) {
      logger.error(`API aiAssessments error: case not exists`);
      return res.status(500).json({ error: "case not exists" });
    }

    const uploadResult = await saveAiAssessment(jsonData, chainId);

    if (!uploadResult.ok) {
      logger.error("API aiAssessments error: fail to save data");
      return res.status(500).json({ error: "fail to save data" });
    }

    uploadedFileUrl = uploadResult.value.url;
    const tx = await rentality.saveInsuranceCaseUrl(jsonData.case_token, uploadedFileUrl);
    await tx.wait();
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    if (!isEmpty(uploadedFileUrl)) {
      await deleteFileByUrl(uploadedFileUrl);
    }
    logger.error("API aiAssessments error:", error);
    return res.status(500).json({ error: "handler error" });
  }
}

function generateXAuthorization() {
  const SECRET_KEY = env.API_AI_DAMAGE_ANALYZE_SECRET;
  if (!SECRET_KEY) {
    logger.error("ai assessment error: secret key was not set");
    throw new Error("Internal dimo error: Key");
  }

  return crypto.createHmac("sha256", SECRET_KEY).digest("hex");
}

function verifyXAuthorization(token: string) {
  const expectedToken = generateXAuthorization();
  return token === expectedToken;
}
