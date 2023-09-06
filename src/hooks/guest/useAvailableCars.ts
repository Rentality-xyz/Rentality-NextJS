import { Contract, BrowserProvider } from "ethers";
import { useState } from "react";
import { rentalityJSON, rentalityCurrencyConverterJSON } from "../../abis";
import {
  ContractCarInfo,
  validateContractCarInfo,
} from "@/model/blockchain/ContractCarInfo";
import { calculateDays } from "@/utils/date";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ContractCreateTripRequest } from "@/model/blockchain/ContractCreateTripRequest";
import {
  SearchCarInfo,
  SearchCarsResult,
  emptySearchCarsResult,
} from "@/model/SearchCarsResult";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { ContractSearchCarParams } from "@/model/blockchain/ContractSearchCarParams";

const useAvailableCars = () => {
  const [dataFetched, setDataFetched] = useState<Boolean>(true);
  const [dataSaved, setDataSaved] = useState<Boolean>(false);
  const [searchCarsResult, setSearchCarsResult] = useState<SearchCarsResult>(
    emptySearchCarsResult
  );

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(
        rentalityJSON.address,
        rentalityJSON.abi,
        signer
      ) as unknown as IRentalityContract;
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

  const searchAvailableCarsFromBlockChain = async (
    rentalityContract: IRentalityContract,
    searchCarRequest: SearchCarRequest
  ): Promise<SearchCarsResult | undefined> => {
    try {
      if (rentalityContract == null) {
        console.error("getAvailableCars error: contract is null");
        return;
      }

      const startDateTime = new Date(searchCarRequest.dateFrom);
      const endDateTime = new Date(searchCarRequest.dateTo);

      const contractDateFrom = BigInt(
        Math.floor(startDateTime.getTime() / 1000)
      );
      const contractDateTo = BigInt(
        Math.floor(endDateTime.getTime() / 1000)
      );
      const contractSearchCarParams: ContractSearchCarParams = {
        country:  "",
        state: "",
        city:  "",
        brand: searchCarRequest.brand ?? "",
        model: searchCarRequest.model ?? "",
        yearOfProductionFrom: BigInt(
          searchCarRequest.yearOfProductionFrom ?? "0"
        ),
        yearOfProductionTo: BigInt(searchCarRequest.yearOfProductionTo ?? "0"),
        pricePerDayInUsdCentsFrom: BigInt(
          Number(searchCarRequest.pricePerDayInUsdFrom) * 100 ?? "0"
        ),
        pricePerDayInUsdCentsTo: BigInt(
          Number(searchCarRequest.pricePerDayInUsdTo) * 100 ?? "0"
        ),
      };

      const availableCarsView: ContractCarInfo[] =
        await rentalityContract.searchAvailableCars(
          contractDateFrom,
          contractDateTo,
          contractSearchCarParams
        );

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
                const meta = await getMetaDataFromIpfs(tokenURI);

                const pricePerDay = Number(i.pricePerDayInUsdCents) / 100;
                let tripDays =
                  calculateDays(
                    startDateTime,
                    endDateTime
                  );
                const totalPrice = pricePerDay * tripDays;
                const fuelPricePerGal =
                  Number(i.fuelPricePerGalInUsdCents) / 100;
                const securityDeposit =
                  Number(i.securityDepositPerTripInUsdCents) / 100;

                let item: SearchCarInfo = {
                  carId: Number(i.carId),
                  ownerAddress: i.createdBy.toString(),
                  image: getIpfsURIfromPinata(meta.image),
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
                  seatsNumber:
                    meta.attributes?.find(
                      (x: any) => x.trait_type === "Seats number"
                    )?.value ?? "",
                  transmission:
                    meta.attributes?.find(
                      (x: any) => x.trait_type === "Transmission"
                    )?.value ?? "",
                  fuelType:
                    meta.attributes?.find(
                      (x: any) => x.trait_type === "Fuel type"
                    )?.value ?? "",
                  milesIncludedPerDay: i.milesIncludedPerDay.toString(),
                  pricePerDay: pricePerDay,
                  fuelPricePerGal: fuelPricePerGal,
                  days: tripDays,
                  totalPrice: totalPrice,
                  securityDeposit: securityDeposit,
                };
                return item;
              })
            );

      return {
        searchCarRequest: searchCarRequest,
        carInfos: availableCarsData,
      };
    } catch (e) {
      console.error("getAvailableCars error:" + e);
    }
  };

  const searchAvailableCars = async (searchCarRequest: SearchCarRequest) => {
    try {
      setDataFetched(false);
      const rentalityContract = await getRentalityContract();
      if (rentalityContract == null) {
        console.error("createTripRequest error: contract is null");
        return false;
      }
      let data = await searchAvailableCarsFromBlockChain(
        rentalityContract,
        searchCarRequest
      );
      setSearchCarsResult(data ?? emptySearchCarsResult);
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
    depositInUsdCents: number,
    fuelPricePerGalInUsdCents: number
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

      const rentPriceInUsdCents =
        (totalDayPriceInUsdCents + taxPriceInUsdCents + depositInUsdCents) | 0;
      const [rentPriceInEth, ethToCurrencyRate, ethToCurrencyDecimals] =
        await rentalityCurrencyConverterContract.getEthFromUsdLatest(
          rentPriceInUsdCents
        );

      const tripRequest: ContractCreateTripRequest = {
        carId: BigInt(carId),
        host: host,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        startLocation: startLocation,
        endLocation: endLocation,
        totalDayPriceInUsdCents: totalDayPriceInUsdCents,
        taxPriceInUsdCents: taxPriceInUsdCents,
        depositInUsdCents: depositInUsdCents,
        fuelPricePerGalInUsdCents: fuelPricePerGalInUsdCents,
        ethToCurrencyRate: BigInt(ethToCurrencyRate),
        ethToCurrencyDecimals: Number(ethToCurrencyDecimals),
      };
      let transaction = await rentalityContract.createTripRequest(tripRequest, {
        value: rentPriceInEth,
      });
      const result = await transaction.wait();
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

  return [
    dataFetched,
    searchCarsResult,
    searchAvailableCars,
    dataSaved,
    createTripRequest,
  ] as const;
};

export default useAvailableCars;
