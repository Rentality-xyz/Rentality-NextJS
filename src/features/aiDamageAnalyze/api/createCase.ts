//TODO obsolete. remove file
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityAiDamageAnalyzeContract } from "@/features/blockchain/models/IRentalityAiDamageAnalyze";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";
import { createAiDamageAnalyzeCase } from "@/features/aiDamageAnalyze/models";
import { CaseType } from "@/model/blockchain/schemas";

type CreateCaseParams = {
  tripId: number;
  name: string;
  email: string;
  vin: string;
  chainId: number;
  caseNum: number;
  pre: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { secret, baseUrl } = await createSecret();
  const { newCase, tripId, chainId, pre } = getCase(req);

  const response = await axios.post(`${baseUrl}/api/v1/case`, newCase, {
    headers: {
      Authorization: `Bearer ${secret.access_token}`,
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 201) {
    console.log("AiDamageAnalyze: failed to create secret with error: ", response.data);
    res.status(500).json({ error: "AiDamageAnalyze: failed to create secret with error: " + response.data });
    return;
  }
  const data = response.data;
  const token = data.case_token["Case token"];

  const providerApiUrl = getProviderApiUrlFromEnv(chainId);

  if (!providerApiUrl) {
    console.error(`API aiAssessments error: API URL for chain id ${chainId} was not set`);
    res.status(500).json({ error: "API aiAssessments error: API URL for chain id ${chainId} was not set " });
    return;
  }
  const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

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
  if (rentality === null) {
    console.error("AiDamageAnalyze: failed to get contract with signer");
    res.status(500).json({ error: "AiDamageAnalyze: failed to get contract with signer" });
    return;
  }
  const caseExists = await rentality.isCaseTokenExists(token);
  if (caseExists) {
    console.log("AiDamageAnalyze: case exists: ", token);
    res.status(500).json({ error: "AiDamageAnalyze: case exists: " + token });
    return;
  }
  try {
    await rentality.saveInsuranceCase(token, BigInt(tripId), pre ? CaseType.PreTrip : CaseType.PostTrip);
  } catch (error) {
    console.error("AiDamageAnalyze: failed to save insurance case with error: ", error);
    return res.status(500).json({ error: "AiDamageAnalyze: failed to save insurance case with error: " + error });
  }

  console.log("AiDamageAnalyze: case created!", token);
  res.status(200).json({ success: true });
}

function getCase(req: NextApiRequest) {
  const request = <CreateCaseParams>req.body;

  return {
    newCase: createAiDamageAnalyzeCase(
      request.tripId,
      request.chainId,
      request.name,
      request.caseNum.toString(),
      request.pre,
      request.email,
      new Date().toISOString()
    ),
    tripId: request.tripId,
    chainId: request.chainId,
    pre: request.pre,
  };
}

export async function createSecret() {
  const baseUrl = process.env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_BASE_URL;
  const accountSid = process.env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SID;
  const accountSecret = process.env.NEXT_PUBLIC_AI_DAMAGE_ANALYZE_ACCOUNT_SECRETKEY;

  const response = await axios.post(
    `${baseUrl}/access_token`,
    {},
    {
      headers: {
        "Account-SID": accountSid,
        "Account-SecretKey": accountSecret,
      },
    }
  );
  if (response.status !== 200) {
    throw new Error("AiDamageAnalyze: failed to create secret with error: ", response.data);
  }
  return { secret: response.data, baseUrl };
}
