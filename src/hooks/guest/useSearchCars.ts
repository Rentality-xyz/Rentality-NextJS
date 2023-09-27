import { Contract, ethers } from "ethers";
import { useCallback, useState } from "react";
import { rentalityCurrencyConverterJSON } from "../../abis";
import {
  ContractCarInfo,
  validateContractCarInfo,
} from "@/model/blockchain/ContractCarInfo";
import { calculateDays } from "@/utils/date";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { ContractCreateTripRequest } from "@/model/blockchain/ContractCreateTripRequest";
import {
  SearchCarInfo,
  SearchCarsResult,
  emptySearchCarsResult,
} from "@/model/SearchCarsResult";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { ContractSearchCarParams } from "@/model/blockchain/ContractSearchCarParams";
import { useRentality } from "@/contexts/rentalityContext";

export const sortOptions = {
  priceAsc: "Price: low to high",
  priceDesc: "Price: high to low",
  distance: "Distance",
};
export type SortOptionKey = keyof typeof sortOptions;
export function isSortOptionKey(key: string): key is SortOptionKey {
  return sortOptions.hasOwnProperty(key);
}

const useSearchCars = () => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(true);
  const [searchResult, setSearchResult] = useState<SearchCarsResult>(
    emptySearchCarsResult
  );

  const getRentalityCurrencyConverterContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
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

  const formatSearchAvailableCarsContractRequest = (
    searchCarRequest: SearchCarRequest
  ) => {
    const startDateTime = new Date(searchCarRequest.dateFrom);
    const endDateTime = new Date(searchCarRequest.dateTo);
    const tripDays = calculateDays(startDateTime, endDateTime);

    const contractDateFrom = BigInt(Math.floor(startDateTime.getTime() / 1000));
    const contractDateTo = BigInt(Math.floor(endDateTime.getTime() / 1000));
    const contractSearchCarParams: ContractSearchCarParams = {
      country: "",
      state: "",
      city: "",
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
    return [
      contractDateFrom,
      contractDateTo,
      contractSearchCarParams,
      tripDays,
    ] as const;
  };

  const formatSearchAvailableCarsContractResponse = async (
    availableCarsView: ContractCarInfo[],
    tripDays: number
  ) => {
    if (availableCarsView.length === 0) return [];

    if (rentalityInfo == null) {
      console.error(
        "formatSearchAvailableCarsContractResponse error: rentalityInfo is null"
      );
      return [];
    }

    return await Promise.all(
      availableCarsView.map(async (i: ContractCarInfo, index) => {
        if (index === 0) {
          validateContractCarInfo(i);
        }
        const tokenURI =
          await rentalityInfo.rentalityContract.getCarMetadataURI(i.carId);
        const meta = await getMetaDataFromIpfs(tokenURI);

        const pricePerDay = Number(i.pricePerDayInUsdCents) / 100;
        const totalPrice = pricePerDay * tripDays;
        const fuelPricePerGal = Number(i.fuelPricePerGalInUsdCents) / 100;
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
            meta.attributes?.find((x: any) => x.trait_type === "Release year")
              ?.value ?? "",
          licensePlate:
            meta.attributes?.find((x: any) => x.trait_type === "License plate")
              ?.value ?? "",
          seatsNumber:
            meta.attributes?.find((x: any) => x.trait_type === "Seats number")
              ?.value ?? "",
          transmission:
            meta.attributes?.find((x: any) => x.trait_type === "Transmission")
              ?.value ?? "",
          fuelType:
            meta.attributes?.find((x: any) => x.trait_type === "Fuel type")
              ?.value ?? "",
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
  };

  const searchAvailableCars = async (searchCarRequest: SearchCarRequest) => {
    if (rentalityInfo === null) {
      console.error("searchAvailableCars: rentalityInfo is null");
      return false;
    }
    const rentalityContract = rentalityInfo.rentalityContract;

    try {
      setDataFetched(false);

      const [
        contractDateFrom,
        contractDateTo,
        contractSearchCarParams,
        tripDays,
      ] = formatSearchAvailableCarsContractRequest(searchCarRequest);

      const availableCarsView: ContractCarInfo[] =
        await rentalityContract.searchAvailableCars(
          contractDateFrom,
          contractDateTo,
          contractSearchCarParams
        );

      const availableCarsData = await formatSearchAvailableCarsContractResponse(
        availableCarsView,
        tripDays
      );

      setSearchResult({
        searchCarRequest: searchCarRequest,
        carInfos: availableCarsData,
      });
      return true;
    } catch (e) {
      console.error("updateData error:" + e);
      return false;
    } finally {
      setDataFetched(true);
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
    if (rentalityInfo === null) {
      console.error("createTripRequest: rentalityInfo is null");
      return false;
    }

    try {
      const rentalityContract = rentalityInfo.rentalityContract;
      const rentalityCurrencyConverterContract =
        await getRentalityCurrencyConverterContract();
      if (rentalityContract == null) {
        console.error("createTripRequest error: rentalityContract is null");
        return false;
      }
      if (rentalityCurrencyConverterContract == null) {
        console.error(
          "createTripRequest error: rentalityCurrencyConverterContract is null"
        );
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
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("createTripRequest error:" + e);
      return false;
    }
  };

  function sortByDailyPriceAsc(a: SearchCarInfo, b: SearchCarInfo) {
    return a.pricePerDay - b.pricePerDay;
  }
  function sortByDailyPriceDes(a: SearchCarInfo, b: SearchCarInfo) {
    return b.pricePerDay - a.pricePerDay;
  }

  function sortByIncludedDistance(a: SearchCarInfo, b: SearchCarInfo) {
    return Number(a.milesIncludedPerDay) - Number(b.milesIncludedPerDay);
  }

  const sortSearchResult = useCallback((sortBy: SortOptionKey) => {
    const sortLogic =
      sortBy === "distance"
        ? sortByIncludedDistance
        : sortBy === "priceDesc"
        ? sortByDailyPriceDes
        : sortByDailyPriceAsc;

    setSearchResult((current) => {
      return {
        searchCarRequest: current.searchCarRequest,
        //TODO carInfos: current.carInfos.toSorted(sortLogic),
        carInfos: [...current.carInfos].sort(sortLogic),
      };
    });
  }, []);

  return [
    dataFetched,
    searchAvailableCars,
    searchResult,
    sortSearchResult,
    createTripRequest,
  ] as const;
};

export default useSearchCars;
