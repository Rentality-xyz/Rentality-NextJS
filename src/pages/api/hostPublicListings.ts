import { getEtherContractWithSigner } from "@/abis";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractPublicHostCarDTO } from "@/model/blockchain/schemas";
import { validateContractPublicHostCarDTO } from "@/model/blockchain/schemas_utils";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { isEmpty } from "@/utils/string";
import { JsonRpcProvider, Wallet } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

const validateWalletAddress = (value: string) => {
  return !isEmpty(value) && value.length === 42 && value.toLowerCase().startsWith("0x");
};
const getHostAddressFromQuery = (query: string | string[] | undefined): string => {
  return query && typeof query === "string" && validateWalletAddress(query) ? query : "";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const privateKey = process.env.NEXT_WALLET_PRIVATE_KEY;
  const providerApiUrl = process.env.PROVIDER_API_URL;
  if (!privateKey) {
    console.error("API checkTrips error: private key was not set");
    res.status(500).json({ error: "private key was not set" });
    return;
  }
  if (!providerApiUrl) {
    console.error("API checkTrips error: API URL was not set");
    res.status(500).json({ error: "API URL was not set" });
    return;
  }

  const { chainId, hostAddress: hostAddressQuery } = req.query;
  const chainIdNumber = Number(chainId) > 0 ? Number(chainId) : Number(process.env.DEFAULT_CHAIN_ID);
  const hostAddress = getHostAddressFromQuery(hostAddressQuery);

  if (!chainIdNumber) {
    console.error("API checkTrips error: chainId was not provided");
    res.status(400).json({ error: "chainId was not provided" });
    return;
  }
  if (isEmpty(hostAddress)) {
    console.error("API checkTrips error: hostAddress was not provided");
    res.status(400).json({ error: "hostAddress was not provided" });
    return;
  }

  console.log(`Calling checkTrips API for ${chainIdNumber} chain id and ${hostAddress} host...`);

  console.log(`Calling blockchain function...`);

  const provider = new JsonRpcProvider(providerApiUrl);
  const wallet = new Wallet(privateKey, provider);

  const rentality = (await getEtherContractWithSigner("gateway", wallet)) as unknown as IRentalityContract;

  const hostPublicListingsView: ContractPublicHostCarDTO[] = await rentality.getCarsOfHost(hostAddress);

  const hostPublicListingsData =
    hostPublicListingsView.length === 0
      ? []
      : await Promise.all(
          hostPublicListingsView.map(async (i: ContractPublicHostCarDTO, index) => {
            if (index === 0) {
              validateContractPublicHostCarDTO(i);
            }
            const meta = await getMetaDataFromIpfs(i.metadataURI);

            const pricePerDay = Number(i.pricePerDayInUsdCents) / 100;
            const securityDeposit = Number(i.securityDepositPerTripInUsdCents) / 100;
            const milesIncludedPerDay = Number(i.milesIncludedPerDay);

            const item: BaseCarInfo = {
              carId: Number(i.carId),
              ownerAddress: hostAddress,
              image: getIpfsURIfromPinata(meta.image),
              brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
              model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
              year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
              licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
              pricePerDay: pricePerDay,
              securityDeposit: securityDeposit,
              milesIncludedPerDay: milesIncludedPerDay,
              currentlyListed: i.currentlyListed,
              isEditable: false,
            };
            return item;
          })
        );

  console.log(`result: ${JSON.stringify(hostPublicListingsData)}`);

  res.status(200).json(hostPublicListingsData);
}
