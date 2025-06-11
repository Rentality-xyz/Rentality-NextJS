import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";

export type DeliveryPrices = {
  from1To25milesPrice: number;
  over25MilesPrice: number;
  isInitialized: boolean;
};

const emptyDeliveryPrices: DeliveryPrices = {
  from1To25milesPrice: 0,
  over25MilesPrice: 0,
  isInitialized: false,
};

export const DELIVERY_PRICES_QUERY_KEY = "DeliveryPrices";

type QueryData = DeliveryPrices;

function useFetchDeliveryPrices() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [DELIVERY_PRICES_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchDeliveryPrices(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? emptyDeliveryPrices;
  return { ...queryResult, data: data };
}

async function fetchDeliveryPrices(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getUserDeliveryPrices(ethereumInfo.walletAddress);
  if (!result.ok) {
    throw result.error;
  }

  const deliveryPrices: DeliveryPrices = {
    from1To25milesPrice: Number(result.value.underTwentyFiveMilesInUsdCents) / 100,
    over25MilesPrice: Number(result.value.aboveTwentyFiveMilesInUsdCents) / 100,
    isInitialized: result.value.initialized,
  };
  return deliveryPrices;
}

export default useFetchDeliveryPrices;
