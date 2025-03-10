import { useRentality } from "@/contexts/rentalityContext";
import { logger } from "@/utils/logger";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";
import { useQuery } from "@tanstack/react-query";

export const REFERRAL_LINKS_QUERY_KEY = "ReferralLinks";
type QueryData = { inviteHash: string; usedInviteHash: string };

const useFetchReferralLinks = () => {
  const { rentalityContracts } = useRentality();

  return useQuery<QueryData>({
    queryKey: [REFERRAL_LINKS_QUERY_KEY],
    initialData: { inviteHash: "", usedInviteHash: "" },
    queryFn: async () => {
      if (!rentalityContracts) {
        throw new Error("Contracts not initialized");
      }
      logger.debug("Fetching referral links");

      const result = await rentalityContracts.referralProgram.getMyRefferalInfo();

      if (!result.ok) {
        throw new Error(result.error.message);
      }
      return {
        inviteHash: result.value.myHash !== ZERO_4_BYTES_HASH ? result.value.myHash : "",
        usedInviteHash: result.value.savedHash !== ZERO_4_BYTES_HASH ? result.value.savedHash : "",
      };
    },
    enabled: !!rentalityContracts,
  });
};

export default useFetchReferralLinks;
