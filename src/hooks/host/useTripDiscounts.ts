import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { useUserInfo } from "@/contexts/userInfoContext";
import { ContractBaseDiscount } from "@/model/blockchain/schemas";
import { Err, TransactionErrorCode, Ok, Result } from "@/model/utils/result";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isUserHasEnoughFunds } from "@/utils/wallet";

export type DiscountFormValues = {
  discount3DaysAndMoreInPercents: number;
  discount7DaysAndMoreInPercents: number;
  discount30DaysAndMoreInPercents: number;
  isInitialized: boolean;
};

const emptyDiscountFormValues: DiscountFormValues = {
  discount3DaysAndMoreInPercents: 0,
  discount7DaysAndMoreInPercents: 0,
  discount30DaysAndMoreInPercents: 0,
  isInitialized: false,
};

const useTripDiscounts = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const userInfo = useUserInfo();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tripDiscounts, setTripDiscounts] = useState<DiscountFormValues>(emptyDiscountFormValues);

  const saveTripDiscounts = async (
    newDiscountFormValues: DiscountFormValues
  ): Promise<Result<boolean, TransactionErrorCode>> => {
    if (!ethereumInfo) {
      console.error("saveTripDiscounts error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContracts) {
      console.error("saveTripDiscounts error: rentalityContract is null");
      return Err("ERROR");
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      console.error("saveTripDiscounts error: user don't have enough funds");
      return Err("NOT_ENOUGH_FUNDS");
    }

    try {
      const discounts: ContractBaseDiscount = {
        threeDaysDiscount: BigInt(newDiscountFormValues.discount3DaysAndMoreInPercents * 10_000),
        sevenDaysDiscount: BigInt(newDiscountFormValues.discount7DaysAndMoreInPercents * 10_000),
        thirtyDaysDiscount: BigInt(newDiscountFormValues.discount30DaysAndMoreInPercents * 10_000),
        initialized: true,
      };
      const transaction = await rentalityContracts.gateway.addUserDiscount(discounts);
      await transaction.wait();
      return Ok(true);
    } catch (e) {
      console.error("saveTripDiscounts error:" + e);
      return Err("ERROR");
    }
  };

  useEffect(() => {
    const getTripDiscounts = async () => {
      try {
        if (!rentalityContracts) {
          console.error("getTripDiscounts error: contract is null");
          return;
        }

        if (!userInfo) {
          console.error("saveTripDiscounts error: userInfo is null");
          return;
        }

        setIsLoading(true);

        const discounts = await rentalityContracts.gateway.getDiscount(userInfo.address);

        const discountFormValues: DiscountFormValues = {
          discount3DaysAndMoreInPercents: Number(discounts.threeDaysDiscount) / 10_000,
          discount7DaysAndMoreInPercents: Number(discounts.sevenDaysDiscount) / 10_000,
          discount30DaysAndMoreInPercents: Number(discounts.thirtyDaysDiscount) / 10_000,
          isInitialized: discounts.initialized,
        };
        setTripDiscounts(discountFormValues);
      } catch (e) {
        console.error("getTripDiscounts error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!rentalityContracts) return;
    if (!userInfo) return;
    getTripDiscounts();
  }, [rentalityContracts, userInfo]);

  return [isLoading, tripDiscounts, saveTripDiscounts] as const;
};

export default useTripDiscounts;
