import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { logger } from "@/utils/logger";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";
import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query";

export const REFERRAL_LINKS_QUERY_KEY = "ReferralLinks";
type QueryData = { inviteHash: string; usedInviteHash: string };

const useFetchReferralLinks = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_LINKS_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts) {
        throw new Error("Contracts not initialized");
      }

      const result = await rentalityContracts.referralProgram.getMyRefferalInfo();

      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return {
        inviteHash: result.value.myHash !== ZERO_4_BYTES_HASH ? result.value.myHash : "",
        usedInviteHash: result.value.savedHash !== ZERO_4_BYTES_HASH ? result.value.savedHash : "",
      };
    },
  });

  const data = queryResult.data ?? { inviteHash: "", usedInviteHash: "" };
  return { ...queryResult, data: data } as DefinedUseQueryResult<QueryData, Error>;
};

export default useFetchReferralLinks;
