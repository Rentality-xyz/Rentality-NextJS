import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON, rentalityCurrencyConverterJSON } from "../../abis";
import {
  ContractCarInfo,
  validateContractCarInfo,
} from "@/model/blockchain/ContractCarInfo";
import { BaseCarInfo } from "@/model/BaseCarInfo";

export type CarRequest = {
  carId: number;
  host: string;
  startDateTime: number;
  endDateTime: number;
  startLocation: string;
  endLocation: string;
  totalDayPriceInUsdCents: number;
  taxPriceInUsdCents: number;
  depositInUsdCents: number;
  ethToCurrencyRate: number;
  ethToCurrencyDecimals: number;
};

const useAvailableCars = () => {
  const [dataFetched, setDataFetched] = useState<Boolean>(true);
  const [dataSaved, setDataSaved] = useState<Boolean>(false);
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

  const getRentalityCurrencyConverterContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(
        rentalityCurrencyConverterJSON.address,
        rentalityCurrencyConverterJSON.abi,
        signer
      );
    } catch (e) {
      console.error("getRentalityCurrencyConverter error:" + e);
    }
  };

  const getAvailableCars = async (rentalityContract: Contract) => {
    try {
      if (rentalityContract == null) {
        console.error("getAvailableCars error: contract is null");
        return;
      }
      const availableCarsView: ContractCarInfo[] =
        await rentalityContract.getAvailableCars();

      const availableCarsData =
        availableCarsView.length === 0
          ? []
          : await Promise.all(
              availableCarsView.map(async (i: ContractCarInfo, index) => {
                if (index === 0) {
                  validateContractCarInfo(i);
                }
                const tokenURI = await rentalityContract.getCarMetadataURI(
                  i.carId
                );
                const ulr = "/api/pinata/getMetadataJson?tokenURI=" + tokenURI;
                console.log("call ulr: " + ulr);
                const response = await fetch(ulr);
                const meta = await response.json();

                console.log("meta: " + JSON.stringify(meta));
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

  const updateData = async ( ) => {
    try {
      setDataFetched(false);
      const rentalityContract = await getRentalityContract();
      if (rentalityContract == null) {
        console.error("createTripRequest error: contract is null");
        return false;
      }
      let data = await getAvailableCars(rentalityContract);      
      setAvailableCars(data ?? []);
      setDataFetched(true);
      return true;
    } catch (e) {
      console.error("updateData error:" + e);
      setDataFetched(true);
      return false;
    }
  };
  const createTripRequest = async (
    carId: number,
    host: string,
    startDateTime: number,
    endDateTime: number,
    startLocation: string,
    endLocation: string,
    totalDayPriceInUsdCents: number,
    taxPriceInUsdCents: number,
    depositInUsdCents: number
  ) => {
    try {
      const rentalityContract = await getRentalityContract();
      const rentalityCurrencyConverterContract =
        await getRentalityCurrencyConverterContract();
      if (rentalityContract == null) {
        console.error("createTripRequest error: contract is null");
        return false;
      }
      if (rentalityCurrencyConverterContract == null) {
        console.error("createTripRequest error: contract is null");
        return false;
      }
      const [ ethToCurrencyRate, ethToCurrencyDecimals ] =
        await rentalityCurrencyConverterContract.getEthToUsdPrice();
      const rentPriceInUsdCents = (totalDayPriceInUsdCents * 100) | 0;
      const rentPriceInEth =
        await rentalityCurrencyConverterContract.getEthFromUsd(
          rentPriceInUsdCents
        );

      const tripRequest: CarRequest = {
        carId: carId,
        host: host,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        startLocation: startLocation,
        endLocation: endLocation,
        totalDayPriceInUsdCents: rentPriceInUsdCents,
        taxPriceInUsdCents: taxPriceInUsdCents,
        depositInUsdCents: depositInUsdCents,
        ethToCurrencyRate: Number(ethToCurrencyRate),
        ethToCurrencyDecimals: Number(ethToCurrencyDecimals),
      };
      let transaction = await rentalityContract.createTripRequest(tripRequest, {
        value: rentPriceInEth,
      });
      const result = await transaction.wait();
      console.log("result: " + JSON.stringify(result));
      setDataSaved(true);
      return true;
    } catch (e) {
      console.error("createTripRequest error:" + e);
      return false;
    }
  };

  // useEffect(() => {
  //   getRentalityContract()
  //     .then((contract) => {
  //       if (contract !== undefined) {
  //         return getAvailableCars(contract);
  //       }
  //     })
  //     .then((data) => {
  //       setAvailableCars(data ?? []);
  //       setDataFetched(true);
  //     })
  //     .catch(() => setDataFetched(true));
  // }, []);

  return [dataFetched, availableCars, updateData, dataSaved, createTripRequest] as const;
};

export default useAvailableCars;
