import { Signer } from "ethers";
import { getContractAddress, getEtherContractWithSigner } from "@/abis";
import { ContractLocationInfo } from "@/model/blockchain/schemas";

export async function signLocationInfo(signer: Signer, locationInfo: ContractLocationInfo) {
  const chainId = Number((await signer.provider?.getNetwork())?.chainId);

  const contractAddress = getContractAddress("verifierService", chainId);

  const domain = {
    name: "RentalityLocationVerifier",
    version: "1",
    chainId: chainId,
    verifyingContract: contractAddress,
  };

  const types = {
    LocationInfo: [
      { name: "userAddress", type: "string" },
      { name: "country", type: "string" },
      { name: "state", type: "string" },
      { name: "city", type: "string" },
      { name: "latitude", type: "string" },
      { name: "longitude", type: "string" },
      { name: "timeZoneId", type: "string" },
    ],
  };

  return await signer.signTypedData(domain, types, locationInfo);
}

export async function checkVerifyFunction(signer: Signer, location: ContractLocationInfo) {
  let contract = await getEtherContractWithSigner("verifierService", signer);
  if (contract === null) {
    console.error("contract is null");
    return;
  }
  let signature = await signLocationInfo(signer, location);
  let signed = {
    locationInfo: location,
    signature,
  };
  let result = await contract.verify(signed);
  console.log("Signer address: ", result);
  console.log("verified address: ", result);
  return signature;
}
