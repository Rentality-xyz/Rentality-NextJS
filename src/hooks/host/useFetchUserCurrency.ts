import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { ZeroAddress } from "ethers";
import { walletActions } from "viem";


export const AVAILABLE_CURRENCY_QUERY_KEY = "AvailableCurrency";
export type AvailableCurrency = {
  currency: string;
  name: string;
}

const emptyAvailableCurrency: AvailableCurrency = {
  currency: ZeroAddress,
  name: "ETH"
};

type QueryData = AvailableCurrency;

function useFetchUserCurrency() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [AVAILABLE_CURRENCY_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchAvailableCurrencies(rentalityContracts, ethereumInfo),
  });

  const data = queryResult.data ?? emptyAvailableCurrency;
  return { ...queryResult, userCurrency: data };
}

async function fetchAvailableCurrencies(
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
