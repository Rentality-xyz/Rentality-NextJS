import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";
import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query";
import { logger } from "@/utils/logger";

export const REFERRAL_USER_BALANCE_QUERY_KEY = "ReferralUserBalance";
type QueryData = number;

function useFetchUserBalance() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }

      const result = await rentalityContracts.referralProgram.addressToPoints(ethereumInfo.walletAddress);

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      return Number(result.value);
    },
  });

  const data = queryResult.data ?? 0;
  return { ...queryResult, data: data } as DefinedUseQueryResult<QueryData, Error>;
}

export default useFetchUserBalance;
