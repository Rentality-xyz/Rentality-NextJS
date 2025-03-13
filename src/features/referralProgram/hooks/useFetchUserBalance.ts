import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { useQuery } from "@tanstack/react-query";

export const REFERRAL_USER_BALANCE_QUERY_KEY = "ReferralUserBalance";
type QueryData = number;

function useFetchUserBalance() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchUserBalance(rentalityContracts, ethereumInfo),
  });

  const data = queryResult.data ?? 0;
  return { ...queryResult, data: data };
}

async function fetchUserBalance(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.referralProgram.addressToPoints(ethereumInfo.walletAddress);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return Number(result.value);
}

export default useFetchUserBalance;
