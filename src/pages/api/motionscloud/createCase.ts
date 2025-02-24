import { NextApiRequest, NextApiResponse } from "next";
import { createSecret } from "./createSecret";
import axios from "axios";
import { createCase } from "@/model/MotionsCloud";
import { JsonRpcProvider, Wallet } from "ethers";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityMotionsCloudContract } from "@/features/blockchain/models/IRentalityMotionsCloud";
import getProviderApiUrlFromEnv from "@/utils/api/providerApiUrl";

type CreateCaseParams = {
  tripId: number,
  name: string,
  email: string,
  vin: string,
  chainId: number,
  caseNum: number
}

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
   console.log('MotionsCloud: failed to create secret with error: ', response.data)
    res.status(500).json({ error: 'MotionsCloud: failed to create secret with error: ' + response.data});
    return
}
const data = response.data;
const token = data.case_token['Case token']

const providerApiUrl = getProviderApiUrlFromEnv(chainId);

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
    "motionsCloud",
    wallet
  )) as unknown as IRentalityMotionsCloudContract;
  const caseExists = await rentality.isCaseExists(token);
  if(caseExists) {
    console.log('MotionsCloud: case exists: ', token)
    res.status(500).json({ error: 'MotionsCloud: case exists: ' + token});
    return
  }
try {
 await rentality.saveInsuranceCase(token, BigInt(tripId))
}
catch(error) {
    console.error("MotionsCloud: failed to save insurance case with error: ", error)
}

    res.status(200).json({ success: true });
}

function getCase(req: NextApiRequest) {
    const request =  <CreateCaseParams>req.body;
    
    return {
      newCase: createCase(
        request.caseNum.toString(),
        request.name, request.caseNum.toString(),
        request.email,
        new Date().toISOString()),
      tripId: request.tripId,
      chainId: request.chainId
    };
}

