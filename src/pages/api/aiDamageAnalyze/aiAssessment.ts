import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { uploadJSONToIPFS } from "@/utils/pinata";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityAiDamageAnalyzeContract } from "@/features/blockchain/models/IRentalityAiDamageAnalyze";
import { env } from "@/utils/env";

const SECRET_KEY = env.API_AI_DAMAGE_ANALYZE_SECRET;

function generateXAuthorization() {
  if (!SECRET_KEY) {
    console.error("ai assessment errror: secret key was not set");
    return;
  }

  return crypto.createHmac("sha256", SECRET_KEY).digest("hex");
}
function verifyXAuthorization(token: string) {
  const expectedToken = generateXAuthorization();
  return token === expectedToken;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers["x-authorization"] as string | undefined;
  if (!token) {
    console.error("API aiAssessment error: x-athorization token is not correct");
    res.status(500).json({ error: "token was not set" });
    return;
  }
  const jsonData = req.body;
  const chainId = env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
  if (!chainId) {
    console.error("API aiAssessments error: chainId was not provided");
    res.status(400).json({ error: "chainId was not provided" });
    return;
  }

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);

  if (!providerApiUrl) {
    console.error(`API aiAssessments error: API URL for chain id ${chainId} was not set`);
    res.status(500).json({ error: `API aiAssessments error: API URL for chain id ${chainId} was not set` });
    return;
  }
  const SIGNER_PRIVATE_KEY = env.SIGNER_PRIVATE_KEY;

  if (!SIGNER_PRIVATE_KEY) {
    console.error("API aiAssesments error: private key was not set");
    res.status(500).json({ error: "private key was not set" });
    return;
  }
  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(SIGNER_PRIVATE_KEY, provider);
  const rentality = (await getEtherContractWithSigner(
    "aiDamageAnalyze",
    wallet
  )) as unknown as IRentalityAiDamageAnalyzeContract;

  const caseExists = await rentality.isCaseExists(jsonData.case_token);

  if (!verifyXAuthorization(token)) {
    console.error(`API aiAssessments error: token was not correct`);
    res.status(500).json({ error: "token was not correct" });
    return;
  }

  if (!caseExists) {
    console.error(`API aiAssessments error: case not exists`);
    res.status(500).json({ error: "case not exists" });
    return;
  }

  const pinataResponse = await uploadJSONToIPFS(jsonData);

  if (pinataResponse.success === false) {
    console.error("API aiAssessments error: fail to save data");
    res.status(400).json({ error: "fail to save data" });
    return;
  }

  const tx = await rentality.saveInsuranceCaseUrl(jsonData.case_token, pinataResponse.pinataURL);
  await tx.wait();
  res.status(200).json({ status: "ok" });
}
