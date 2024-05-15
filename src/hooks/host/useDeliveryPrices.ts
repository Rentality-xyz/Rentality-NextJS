import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { ContractDeliveryPrices } from "@/model/blockchain/schemas";

export type DeliveryPricesFormValues = {
  from1To25milesPrice: number;
  over25MilesPrice: number;
};

const emptyDiscountFormValues: DeliveryPricesFormValues = {
  from1To25milesPrice: 0,
  over25MilesPrice: 0,
};

const useDeliveryPrices = () => {
  const rentalityContract = useRentality();
  const userInfo = useUserInfo();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPricesFormValues>(emptyDiscountFormValues);

  const saveDeliveryPrices = async (newDeliveryPricesValues: DeliveryPricesFormValues) => {
    if (!rentalityContract) {
      console.error("saveDeliveryPrices error: rentalityContract is null");
      return false;
    }

    try {
      const underTwentyFiveMilesInUsdCents = BigInt(newDeliveryPricesValues.from1To25milesPrice * 100);
      const aboveTwentyFiveMilesInUsdCents = BigInt(newDeliveryPricesValues.over25MilesPrice * 100);

      const transaction = await rentalityContract.addUserDeliveryPrices(
        underTwentyFiveMilesInUsdCents,
        aboveTwentyFiveMilesInUsdCents
      );
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveTripDiscounts error:" + e);
      return false;
    }
  };

  useEffect(() => {
    const getDeliveryPrices = async () => {
      try {
        if (rentalityContract == null) {
          console.error("getDeliveryPrices error: contract is null");
          return;
        }

        if (!userInfo) {
          console.error("getDeliveryPrices error: userInfo is null");
          return;
        }

        setIsLoading(true);

        const data = await rentalityContract.getUserDeliveryPrices(userInfo.address);

        const deliveryPricesFormValues: DeliveryPricesFormValues = {
          from1To25milesPrice: Number(data.underTwentyFiveMilesInUsdCents) / 100,
          over25MilesPrice: Number(data.aboveTwentyFiveMilesInUsdCents) / 100,
        };
        setDeliveryPrices(deliveryPricesFormValues);
      } catch (e) {
        console.error("getTripDiscounts error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!rentalityContract) return;
    if (!userInfo) return;
    getDeliveryPrices();
  }, [rentalityContract, userInfo]);

  return [isLoading, deliveryPrices, saveDeliveryPrices] as const;
};

export default useDeliveryPrices;
