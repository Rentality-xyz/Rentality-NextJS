import { useCallback, useState } from "react";
import { getEtherContractWithSigner } from "../../abis";
import { getEngineTypeString } from "@/model/EngineType";
import { calculateDays } from "@/utils/date";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { SearchCarInfo, SearchCarsResult, emptySearchCarsResult } from "@/model/SearchCarsResult";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { useRentality } from "@/contexts/rentalityContext";
import { getBlockchainTimeFromDate, getMoneyInCentsFromString } from "@/utils/formInput";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { IRentalityCurrencyConverterContract } from "@/model/blockchain/IRentalityContract";
import moment from "moment";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractCreateTripRequest,
  ContractSearchCar,
  ContractSearchCarParams,
  EngineType,
} from "@/model/blockchain/schemas";
import { validateContractSearchCar } from "@/model/blockchain/schemas_utils";

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
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchCarsResult>(emptySearchCarsResult);

  const formatSearchAvailableCarsContractRequest = (searchCarRequest: SearchCarRequest) => {
    const startDateTimeUTC = moment
      .utc(searchCarRequest.dateFrom)
      .subtract(searchCarRequest.utcOffsetMinutes, "minutes")
      .toDate();
    const endDateTimeUTC = moment
      .utc(searchCarRequest.dateTo)
      .subtract(searchCarRequest.utcOffsetMinutes, "minutes")
      .toDate();

    console.log(`utcOffsetMinutes: ${searchCarRequest.utcOffsetMinutes}`);
    console.log(`dateFrom string: ${searchCarRequest.dateFrom}`);
    console.log(`startDateTimeUTC string: ${startDateTimeUTC}`);
    console.log(`dateTo string: ${searchCarRequest.dateTo}`);
    console.log(`endDateTimeUTC string: ${endDateTimeUTC}`);

    const tripDays = calculateDays(startDateTimeUTC, endDateTimeUTC);

    const contractDateFromUTC = getBlockchainTimeFromDate(startDateTimeUTC);
    const contractDateToUTC = getBlockchainTimeFromDate(endDateTimeUTC);
    const contractSearchCarParams: ContractSearchCarParams = {
      country: "", //searchCarRequest.country ?? "",
      state: "", //searchCarRequest.state ?? "",
      city: searchCarRequest.city ?? "",
      brand: searchCarRequest.brand ?? "",
      model: searchCarRequest.model ?? "",
      yearOfProductionFrom: BigInt(searchCarRequest.yearOfProductionFrom ?? "0"),
      yearOfProductionTo: BigInt(searchCarRequest.yearOfProductionTo ?? "0"),
      pricePerDayInUsdCentsFrom: BigInt(getMoneyInCentsFromString(searchCarRequest.pricePerDayInUsdFrom)),
      pricePerDayInUsdCentsTo: BigInt(getMoneyInCentsFromString(searchCarRequest.pricePerDayInUsdTo)),
    };
    return [contractDateFromUTC, contractDateToUTC, contractSearchCarParams, tripDays] as const;
  };

  const formatSearchAvailableCarsContractResponse = async (
    searchCarsViewsView: ContractSearchCar[],
    tripDays: number
  ) => {
    if (searchCarsViewsView.length === 0) return [];

    if (rentalityContract == null) {
      console.error("formatSearchAvailableCarsContractResponse error: rentalityContract is null");
      return [];
    }

    return await Promise.all(
      searchCarsViewsView.map(async (i: ContractSearchCar, index) => {
        if (index === 0) {
          validateContractSearchCar(i);
        }
        const meta = await getMetaDataFromIpfs(i.metadataURI);

        const pricePerDay = Number(i.pricePerDayInUsdCents) / 100;
        const totalPrice = pricePerDay * tripDays;
        const securityDeposit = Number(i.securityDepositPerTripInUsdCents) / 100;

        let item: SearchCarInfo = {
          carId: Number(i.carId),
          ownerAddress: i.host.toString(),
          image: getIpfsURIfromPinata(meta.image),
          brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
          model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
          year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
          seatsNumber: meta.attributes?.find((x: any) => x.trait_type === "Seats number")?.value ?? "",
          transmission: meta.attributes?.find((x: any) => x.trait_type === "Transmission")?.value ?? "",
          engineTypeText: getEngineTypeString(i.engineType ?? EngineType.PATROL),
          milesIncludedPerDay: getMilesIncludedPerDayText(i.milesIncludedPerDay ?? 0),
          pricePerDay: pricePerDay,
          days: tripDays,
          totalPrice: totalPrice,
          securityDeposit: securityDeposit,
          hostPhotoUrl: i.hostPhotoUrl,
          hostName: i.hostName,
          timeZoneId: i.timeZoneId,
        };

        return item;
      })
    );
  };

  const searchAvailableCars = async (searchCarRequest: SearchCarRequest) => {
    if (rentalityContract === null) {
      console.error("searchAvailableCars: rentalityContract is null");
      return false;
    }

    try {
      setIsLoading(true);

      const [contractDateFrom, contractDateTo, contractSearchCarParams, tripDays] =
        formatSearchAvailableCarsContractRequest(searchCarRequest);

      const searchCarsView: ContractSearchCar[] = await rentalityContract.searchAvailableCars(
        contractDateFrom,
        contractDateTo,
        contractSearchCarParams
      );

      const availableCarsData = await formatSearchAvailableCarsContractResponse(searchCarsView, tripDays);

      setSearchResult({
        searchCarRequest: searchCarRequest,
        carInfos: availableCarsData,
      });
      return true;
    } catch (e) {
      console.error("updateData error:" + e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createTripRequest = async (
    carId: number,
    host: string,
    startDateTime: Date,
    endDateTime: Date,
    utcOffsetMinutes: number,
    startLocation: string,
    endLocation: string,
    totalDayPriceInUsdCents: number,
    taxPriceInUsdCents: number,
    depositInUsdCents: number
  ) => {
    if (ethereumInfo === null) {
      console.error("createTripRequest: ethereumInfo is null");
      return false;
    }
    if (rentalityContract === null) {
      console.error("createTripRequest: rentalityContract is null");
      return false;
    }

    try {
      const rentalityCurrencyConverterContract = (await getEtherContractWithSigner(
        "currencyConverter",
        ethereumInfo.signer
      )) as unknown as IRentalityCurrencyConverterContract;
      if (rentalityContract == null) {
        console.error("createTripRequest error: rentalityContract is null");
        return false;
      }
      if (rentalityCurrencyConverterContract == null) {
        console.error("createTripRequest error: rentalityCurrencyConverterContract is null");
        return false;
      }
      const startDateTimeUTC = moment.utc(startDateTime).subtract(utcOffsetMinutes, "minutes").toDate();
      const endDateTimeUTC = moment.utc(endDateTime).subtract(utcOffsetMinutes, "minutes").toDate();

      const startTimeUTC = getBlockchainTimeFromDate(startDateTimeUTC);
      const endTimeUTC = getBlockchainTimeFromDate(endDateTimeUTC);

      const rentPriceInUsdCents = (totalDayPriceInUsdCents + taxPriceInUsdCents + depositInUsdCents) | 0;

      const { valueInEth, ethToUsdRate, ethToUsdDecimals } =
        await rentalityCurrencyConverterContract.getEthFromUsdLatest(BigInt(rentPriceInUsdCents));

      const tripRequest: ContractCreateTripRequest = {
        carId: BigInt(carId),
        host: host,
        startDateTime: startTimeUTC,
        endDateTime: endTimeUTC,
        startLocation: startLocation,
        endLocation: endLocation,
        totalDayPriceInUsdCents: BigInt(totalDayPriceInUsdCents),
        taxPriceInUsdCents: BigInt(taxPriceInUsdCents),
        depositInUsdCents: BigInt(depositInUsdCents),
        ethToCurrencyRate: BigInt(ethToUsdRate),
        ethToCurrencyDecimals: BigInt(ethToUsdDecimals),
      };

      const transaction = await rentalityContract.createTripRequest(tripRequest, {
        value: valueInEth,
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
  return [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest] as const;
};

export default useSearchCars;
