import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";

export const REFERRAL_USER_BALANCE_QUERY_KEY = "ReferralUserBalance";
type QueryData = number;

function useFetchUserBalance() {
  const ethereumInfo = useEthereum();
   const rentality = useRentality()

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY, ethereumInfo?.walletAddress, rentality.rentalityContracts],
    queryFn: async () => fetchUserBalance(ethereumInfo, rentality.rentalityContracts),
  });

  const data = queryResult.data ?? 0;
  return { ...queryResult, data: data };
}

async function fetchUserBalance(ethereumInfo: EthereumInfo | null | undefined, rentalityContracts: IRentalityContracts | null | undefined) {
  if (!ethereumInfo || !ethereumInfo.walletAddress || !rentalityContracts) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.addressToPoints(ethereumInfo.walletAddress);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return Number(result.value);
}

export default useFetchUserBalance;
