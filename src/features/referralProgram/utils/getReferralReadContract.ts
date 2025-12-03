import { getEtherContractWithProvider } from "@/abis";
import { IRentalityReferralProgram, IRentalityReferralProgramContract } from "@/features/blockchain/models/IRentalityReferralProgram";
import { getEthersContractProxy } from "@/features/blockchain/models/EthersContractProxy";
import getDefaultProvider from "@/utils/api/defaultProviderUrl";
import { logger } from "@/utils/logger";

let cachedReferralRead: IRentalityReferralProgram | null = null;

export async function getReferralReadContract(): Promise<IRentalityReferralProgram> {
  if (cachedReferralRead) {
    return cachedReferralRead;
  }

  const provider = await getDefaultProvider();
  const contract = (await getEtherContractWithProvider(
    "refferalPogram",
    provider
  )) as IRentalityReferralProgramContract | null;

  if (!contract) {
    logger.error("Referral read contract is null");
    throw new Error("Referral contract is not available");
  }

  cachedReferralRead = getEthersContractProxy(contract);
  return cachedReferralRead;
}
