import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { getReferralReadContract } from "@/features/referralProgram/utils/getReferralReadContract";

export const REFERRAL_USER_BALANCE_QUERY_KEY = "ReferralUserBalance";
type QueryData = number;

function useFetchUserBalance() {
  const ethereumInfo = useEthereum();

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => fetchUserBalance(ethereumInfo),
  });

  const data = queryResult.data ?? 0;
  return { ...queryResult, data: data };
}

async function fetchUserBalance(ethereumInfo: EthereumInfo | null | undefined) {
  if (!ethereumInfo || !ethereumInfo.walletAddress) {
    throw new Error("Contracts or wallet not initialized");
  }

  const referralProgram = await getReferralReadContract();
  const result = await referralProgram.addressToPoints(ethereumInfo.walletAddress);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return Number(result.value);
}

export default useFetchUserBalance;
