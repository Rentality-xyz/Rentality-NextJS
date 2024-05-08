import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { ethers } from "ethers";
import { isEmpty } from "@/utils/string";
import { useUserInfo } from "@/contexts/userInfoContext";
import { ContractBaseDiscount } from "@/model/blockchain/schemas";

export type DiscountFormValues = {
  discount3DaysAndMoreInPercents: number;
  discount7DaysAndMoreInPercents: number;
  discount30DaysAndMoreInPercents: number;
};

const emptyDiscountFormValues: DiscountFormValues = {
  discount3DaysAndMoreInPercents: 0,
  discount7DaysAndMoreInPercents: 0,
  discount30DaysAndMoreInPercents: 0,
};

const useTripDiscounts = () => {
  const rentalityContract = useRentality();
  const userInfo = useUserInfo();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [tripDiscounts, setTripDiscounts] = useState<DiscountFormValues>(emptyDiscountFormValues);

  const saveTripDiscounts = async (newDiscountFormValues: DiscountFormValues) => {
    if (!rentalityContract) {
      console.error("saveTripDiscounts error: rentalityContract is null");
      return false;
    }

    try {
      const discounts: ContractBaseDiscount = {
        threeDaysDiscount: BigInt(newDiscountFormValues.discount3DaysAndMoreInPercents * 10_000),
        sevenDaysDiscount: BigInt(newDiscountFormValues.discount7DaysAndMoreInPercents * 10_000),
        thirtyDaysDiscount: BigInt(newDiscountFormValues.discount30DaysAndMoreInPercents * 10_000),
        initialized: true,
      };

      const transaction = await rentalityContract.addUserDiscount(discounts);
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveTripDiscounts error:" + e);
      return false;
    }
  };

  useEffect(() => {
    const getTripDiscounts = async () => {
      try {
        if (rentalityContract == null) {
          console.error("getTripDiscounts error: contract is null");
          return;
        }

        if (!userInfo) {
          console.error("saveTripDiscounts error: userInfo is null");
          return;
        }

        setIsLoading(true);

        const discounts = await rentalityContract.getDiscount(userInfo.address);

        const discountFormValues: DiscountFormValues = {
          discount3DaysAndMoreInPercents: Number(discounts.threeDaysDiscount) / 10_000,
          discount7DaysAndMoreInPercents: Number(discounts.sevenDaysDiscount) / 10_000,
          discount30DaysAndMoreInPercents: Number(discounts.thirtyDaysDiscount) / 10_000,
        };
        setTripDiscounts(discountFormValues);
      } catch (e) {
        console.error("getTripDiscounts error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!rentalityContract) return;
    if (!userInfo) return;
    getTripDiscounts();
  }, [rentalityContract, userInfo]);

  return [isLoading, tripDiscounts, saveTripDiscounts] as const;
};

export default useTripDiscounts;
