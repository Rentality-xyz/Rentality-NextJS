import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityMotionsCloudContract } from "@/features/blockchain/models/IRentalityMotionsCloud";
import { env } from "@/utils/env";
import { logger } from "@/utils/logger";
import { deleteFileByUrl, saveAiAssessment } from "@/features/filestore/pinata/utils";
import { isEmpty } from "@/utils/string";
import { parseId } from "@/utils/encodeChainId";

function generateXAuthorization() {
  const SECRET_KEY = env.API_MOTIONSCLOUD_SECRET;
  if (!SECRET_KEY) {
    logger.error("ai assessment errror: secret key was not set");
    throw new Error("Internal server error: Key");
  }

  return crypto.createHmac("sha256", SECRET_KEY).digest("hex");
}
function verifyXAuthorization(token: string) {
  const expectedToken = generateXAuthorization();
  return token === expectedToken;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let uploadedFileUrl: string = "";

  try {
    const token = req.headers["x-authorization"] as string | undefined;
    if (!token) {
      logger.error("API aiAssessment error: x-athorization token is not correct");
      return res.status(401).json({ error: "token was not set" });
    }
    const jsonData = req.body;
    const case_number = jsonData.data.case_number;
    const chainId = parseId(case_number);
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
      "motionsCloud",
      wallet
    )) as unknown as IRentalityMotionsCloudContract;

    const caseExists = await rentality.isCaseExists(jsonData.case_token);

    if (!verifyXAuthorization(token)) {
      logger.error(`API aiAssessments error: token was not correct`);
      return res.status(401).json({ error: "token was not correct" });
    }

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
    return res.status(500).json({ status: "error", error });
  }
}
