import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";

export type DeliveryPrices = {
  from1To25milesPrice: number;
  over25MilesPrice: number;
};

const emptyDeliveryPrices: DeliveryPrices = {
  from1To25milesPrice: 0,
  over25MilesPrice: 0,
};

export const DELIVERY_PRICES_QUERY_KEY = "DeliveryPrices";

type QueryData = DeliveryPrices;

function useFetchDeliveryPrices() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  return useQuery<QueryData>({
    queryKey: [DELIVERY_PRICES_QUERY_KEY, ethereumInfo?.walletAddress],
    initialData: emptyDeliveryPrices,
    queryFn: async () => {
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
      };
      return deliveryPrices;
    },
    enabled: !!rentalityContracts && !!ethereumInfo,
  });
}

export default useFetchDeliveryPrices;
