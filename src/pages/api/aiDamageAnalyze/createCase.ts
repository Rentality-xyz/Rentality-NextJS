import { NextApiRequest, NextApiResponse } from "next";
import { createSecret } from "./createSecret";
import axios from "axios";
import { createCase } from "@/model/AiDamageAnalyze";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityAiDamageAnalyzeContract } from "@/features/blockchain/models/IRentalityAiDamageAnalyze";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {secret, baseUrl} = await createSecret();
    const {newCase, tripId, chainId} = getCase(req)

    const response = await axios.post(
        `${baseUrl}/api/v1/case`,
            newCase,
        {
            headers: {
                    'Authorization': `Bearer ${secret.access_token}`, 
                    'Content-Type': 'application/json'
            }
        }
    );
if(response.status !== 201) {
   console.log('AiDamageAnalyze: failed to create secret with error: ', response.data)
    res.status(500).json({ error: 'AiDamageAnalyze: failed to create secret with error: ' + response.data});
    return
}
const data = response.data;
const token = data.case_token['Case token']

const providerApiUrl = getProviderApiUrlFromEnv(Number.parseInt(chainId));

  if (!providerApiUrl) {
    console.error(`API aiAssessments error: API URL for chain id ${chainId} was not set`);
    res.status(500).json({ error: `API aiAssessments error: API URL for chain id ${chainId} was not set` });
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
  const caseExists = await rentality.isCaseExists(token);
  if(caseExists) {
    console.log('AiDamageAnalyze: case exists: ', token)
    res.status(500).json({ error: 'AiDamageAnalyze: case exists: ' + token});
    return
  }
try {
  console.log("token", token)
 await rentality.saveInsuranceCase(token, BigInt(tripId))
}
catch(error) {
    console.error("AiDamageAnalyze: failed to save insurance case with error: ", error)
}

    res.status(200).json({ success: true });
}

function getCase(req: NextApiRequest) {
    const caseNum = <string>req.query.caseNum!;
    const name = <string>req.query.name!;
    const email = <string>req.query.email!;
    const vin = <string>req.query.vin!;
    const tripId = <string>req.query.tripId!;
    const chainId = <string>req.query.chainId!;
    
    return {newCase: createCase(caseNum, name, email, new Date().toISOString(), vin), tripId, chainId};
}

