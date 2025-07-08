import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { ZeroAddress } from "ethers";

export const USER_CURRENCY_QUERY_KEY = "UserCurrency";
export type UserCurrency = {
  currency: string;
  name: string;
  //initialized: boolean;
};

const emptyAvailableCurrency: UserCurrency = {
  currency: ZeroAddress,
  name: "ETH",
  //initialized: false,
};

type QueryData = UserCurrency;

function useFetchUserCurrency() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [USER_CURRENCY_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => await fetchUserCurrency(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? emptyAvailableCurrency;
  return { ...queryResult, data: data };
}

async function fetchUserCurrency(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getUserCurrency(ethereumInfo.walletAddress);

  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}

export default useFetchUserCurrency;
