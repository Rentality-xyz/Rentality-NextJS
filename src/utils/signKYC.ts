import { Signer } from "ethers";
import { getContractAddress, getEtherContractWithSigner } from "@/abis";
import { ContractCivicKYCInfo } from "@/model/blockchain/schemas";

export async function signKycInfo(signer: Signer, kyc: ContractCivicKYCInfo) {
  const chainId = Number((await signer.provider?.getNetwork())?.chainId);

  const contractAddress = getContractAddress("verifierService", chainId);

  const domain = {
    name: "RentalityLocationVerifier",
    version: "1",
    chainId: chainId,
    verifyingContract: contractAddress,
  };

  const types = {
    CivicKYCInfo: [
      { name: "fullName", type: "string" },
      { name: "licenseNumber", type: "string" },
      { name: "expirationDate", type: "uint64" },
      { name: "issueCountry", type: "string" },
      { name: "email", type: "string" },
    ],
  };

  return await signer.signTypedData(domain, types, kyc);
}

export async function checkKYCVerifyFunction(signer: Signer, kyc: ContractCivicKYCInfo) {
  let contract = await getEtherContractWithSigner("verifierService", signer);
  if (contract === null) {
    console.error("contract is null");
    return;
  }
  let signature = await signKycInfo(signer, kyc);

  let result = await contract.verifyKYCInfo(kyc, signature);
  console.log("Signer address: ", result);
  console.log("verified address: ", result);
  return { signature, verifyAddress: result };
}
