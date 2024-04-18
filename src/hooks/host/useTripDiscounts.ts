import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { ethers } from "ethers";
import { isEmpty } from "@/utils/string";
import { useUserInfo } from "@/contexts/userInfoContext";

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
      const data = {
        threeDaysDiscount: newDiscountFormValues.discount3DaysAndMoreInPercents * 10_000,
        sevenDaysDiscount: newDiscountFormValues.discount7DaysAndMoreInPercents * 10_000,
        thirtyDaysDiscount: newDiscountFormValues.discount30DaysAndMoreInPercents * 10_000,
        initialized: true,
      };

      const abiEncoder = ethers.AbiCoder.defaultAbiCoder();
      const encodedData = abiEncoder.encode(
        ["uint32", "uint32", "uint32", "bool"],
        [data.threeDaysDiscount, data.sevenDaysDiscount, data.thirtyDaysDiscount, data.initialized]
      );
      const transaction = await rentalityContract.addUserDiscount(encodedData);
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

        const discountData = await rentalityContract.getDiscount(userInfo.address);
        if (isEmpty(discountData)) return;

        const abiEncoder = ethers.AbiCoder.defaultAbiCoder();
        const decodedData = abiEncoder.decode(["uint32", "uint32", "uint32", "bool"], discountData);

        const discountFormValues: DiscountFormValues = {
          discount3DaysAndMoreInPercents: Number(decodedData[0]) / 10_000,
          discount7DaysAndMoreInPercents: Number(decodedData[1]) / 10_000,
          discount30DaysAndMoreInPercents: Number(decodedData[2]) / 10_000,
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
