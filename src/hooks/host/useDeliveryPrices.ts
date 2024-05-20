import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { useUserInfo } from "@/contexts/userInfoContext";

export type DeliveryPrices = {
  from1To25milesPrice: number;
  over25MilesPrice: number;
};

const emptyDeliveryPrices: DeliveryPrices = {
  from1To25milesPrice: 0,
  over25MilesPrice: 0,
};

const useDeliveryPrices = () => {
  const rentalityContract = useRentality();
  const userInfo = useUserInfo();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrices>(emptyDeliveryPrices);

  const saveDeliveryPrices = async (newDeliveryPrices: DeliveryPrices) => {
    if (!rentalityContract) {
      console.error("saveDeliveryPrices error: rentalityContract is null");
      return false;
    }

    try {
      const transaction = await rentalityContract.addUserDeliveryPrices(
        BigInt(newDeliveryPrices.from1To25milesPrice * 100),
        BigInt(newDeliveryPrices.over25MilesPrice * 100)
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

        const deliveryPricesFormValues: DeliveryPrices = {
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
