import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";

export type TripDiscounts = {
  discount3DaysAndMoreInPercents: number;
  discount7DaysAndMoreInPercents: number;
  discount30DaysAndMoreInPercents: number;
  isInitialized: boolean;
};

const emptyDiscountFormValues: TripDiscounts = {
  discount3DaysAndMoreInPercents: 0,
  discount7DaysAndMoreInPercents: 0,
  discount30DaysAndMoreInPercents: 0,
  isInitialized: false,
};

export const TRIP_DISCOUNTS_QUERY_KEY = "TripDiscounts";

type QueryData = TripDiscounts;

function useFetchTripDiscounts() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  return useQuery<QueryData>({
    queryKey: [TRIP_DISCOUNTS_QUERY_KEY, ethereumInfo?.walletAddress],
    initialData: emptyDiscountFormValues,
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }

      const result = await rentalityContracts.gatewayProxy.getDiscount(ethereumInfo.walletAddress);
      if (!result.ok) {
        throw result.error;
      }

      const tripDiscounts: TripDiscounts = {
        discount3DaysAndMoreInPercents: Number(result.value.threeDaysDiscount) / 10_000,
        discount7DaysAndMoreInPercents: Number(result.value.sevenDaysDiscount) / 10_000,
        discount30DaysAndMoreInPercents: Number(result.value.thirtyDaysDiscount) / 10_000,
        isInitialized: result.value.initialized,
      };

      return tripDiscounts;
    },
    enabled: !!rentalityContracts && !!ethereumInfo,
  });
}

export default useFetchTripDiscounts;
