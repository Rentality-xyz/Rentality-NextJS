import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import {rentalityJSON} from "../../abis";
import {
  ContractCarInfo,
  validateContractCarInfo,
} from "@/model/blockchain/ContractCarInfo";
import { BaseCarInfo } from "@/model/BaseCarInfo";

const useAvailableCars = () => {
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [availableCars, setAvailableCars] = useState<BaseCarInfo[]>([]);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(rentalityJSON.address, rentalityJSON.abi, signer);
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

  const getAvailableCars = async (rentalityContract: Contract) => {
    try {
      if (rentalityContract === null) {
        console.error("getAvailableCars error: contract is null");
        return;
      }
      const availableCarsView: ContractCarInfo[] =
        await rentalityContract.getAllAvailableCarsForUser(rentalityContract.runner);

      const availableCarsData =
        availableCarsView.length === 0
          ? []
          : await Promise.all(
              availableCarsView.map(async (i: ContractCarInfo, index) => {
                if (index === 0) {
                  validateContractCarInfo(i);
                }
                const response = await fetch(tokenURI, {
                  headers: {
                    Accept: "application/json",
                  },
                });
                const tokenURI = await rentalityContract.getCarMetadataURI(
                  i.carId
                );
                const meta = await response.json();

                const price = Number(i.pricePerDayInUsdCents) / 100;

                let item: BaseCarInfo = {
                  carId: Number(i.carId),
                  ownerAddress: i.createdBy.toString(),
                  image: meta.image,
                  brand:
                    meta.attributes?.find((x: any) => x.trait_type === "Brand")
                      ?.value ?? "",
                  model:
                    meta.attributes?.find((x: any) => x.trait_type === "Model")
                      ?.value ?? "",
                  year:
                    meta.attributes?.find(
                      (x: any) => x.trait_type === "Release year"
                    )?.value ?? "",
                  licensePlate:
                    meta.attributes?.find(
                      (x: any) => x.trait_type === "License plate"
                    )?.value ?? "",
                  pricePerDay: price,
                };
                return item;
              })
            );

      return availableCarsData;
    } catch (e) {
      console.error("getAvailableCars error:" + e);
    }
  };

  const sendRentCarRequest = async (carId:number, totalPrice:number, daysToRent:number) => {
    try {
      const rentalityContract = await getRentalityContract();
      if (rentalityContract === null || rentalityContract === undefined) {
        console.error("sendRentCarRequest error: contract is null");
        return;
      }

      const rentPriceInUsdCents = (totalPrice * 100) | 0;
      const rentPriceInEth = await rentalityContract.getEthFromUsd(rentPriceInUsdCents);

      let transaction = await rentalityContract.rentCar(carId, daysToRent, {
        value: rentPriceInEth,
      });
      await transaction.wait();
    } catch (e) {
      console.error("getAvailableCars error:" + e);
    }
  };

  useEffect(() => {
    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getAvailableCars(contract);
        }
      })
      .then((data) => {
        setAvailableCars(data ?? []);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [dataFetched, availableCars, sendRentCarRequest] as const;
};

export default useAvailableCars;
