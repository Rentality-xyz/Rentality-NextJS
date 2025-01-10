import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isUserHasEnoughFunds } from "@/utils/wallet";

export type DeliveryPrices = {
  from1To25milesPrice: number;
  over25MilesPrice: number;
};

const emptyDeliveryPrices: DeliveryPrices = {
  from1To25milesPrice: 0,
  over25MilesPrice: 0,
};

const useDeliveryPrices = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const userInfo = useUserInfo();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrices>(emptyDeliveryPrices);

  const saveDeliveryPrices = async (
    newDeliveryPrices: DeliveryPrices
  ): Promise<Result<boolean, TransactionErrorCode>> => {
    if (!ethereumInfo) {
      console.error("saveDeliveryPrices error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContracts) {
      console.error("saveDeliveryPrices error: rentalityContract is null");
      return Err("ERROR");
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      console.error("saveDeliveryPrices error: user don't have enough funds");
      return Err("NOT_ENOUGH_FUNDS");
    }

    try {
      const transaction = await rentalityContracts.gateway.addUserDeliveryPrices(
        BigInt(newDeliveryPrices.from1To25milesPrice * 100),
        BigInt(newDeliveryPrices.over25MilesPrice * 100)
      );
      await transaction.wait();
      return Ok(true);
    } catch (e) {
      console.error("saveDeliveryPrices error:" + e);
      return Err("ERROR");
    }
  };

  useEffect(() => {
    const getDeliveryPrices = async () => {
      try {
        if (rentalityContracts == null) {
          console.error("getDeliveryPrices error: contract is null");
          return;
        }

        if (!userInfo) {
          console.error("getDeliveryPrices error: userInfo is null");
          return;
        }

        setIsLoading(true);

        const data = await rentalityContracts.gateway.getUserDeliveryPrices(userInfo.address);

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

    if (!rentalityContracts) return;
    if (!userInfo) return;
    getDeliveryPrices();
  }, [rentalityContracts, userInfo]);

  return [isLoading, deliveryPrices, saveDeliveryPrices] as const;
};

export default useDeliveryPrices;
