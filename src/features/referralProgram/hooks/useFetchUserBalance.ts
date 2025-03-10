import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";
import { useQuery } from "@tanstack/react-query";
import { logger } from "@/utils/logger";

export const REFERRAL_USER_BALANCE_QUERY_KEY = "ReferralUserBalance";
type QueryData = number;

function useFetchUserBalance() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  return useQuery<QueryData>({
    queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY, ethereumInfo?.walletAddress],
    initialData: 0,
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }
      logger.debug("Fetching user balance");

      const result = await rentalityContracts.referralProgram.addressToPoints(ethereumInfo.walletAddress);

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      return Number(result.value);
    },
    enabled: !!rentalityContracts && !!ethereumInfo?.walletAddress,
  });
}

export default useFetchUserBalance;
