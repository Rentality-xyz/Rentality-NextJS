import {useCallback, useState} from "react";
import {calculateDays} from "@/utils/date";
import {SearchCarInfo, SearchCarsResult, emptySearchCarsResult} from "@/model/SearchCarsResult";
import {SearchCarRequest} from "@/model/SearchCarRequest";
import {useRentality} from "@/contexts/rentalityContext";
import {getBlockchainTimeFromDate} from "@/utils/formInput";
import moment from "moment";
import {useEthereum} from "@/contexts/web3/ethereumContext";
import {ContractCreateTripRequest} from "@/model/blockchain/schemas";
import {ethers} from "ethers";

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

    const searchAvailableCars = async (searchCarRequest: SearchCarRequest) => {
        try {
            setIsLoading(true);

            var url = new URL(`/api/publicSearchCars`, window.location.origin);
            if (ethereumInfo?.chainId) url.searchParams.append("chainId", ethereumInfo.chainId.toString());
            if (searchCarRequest.dateFrom) url.searchParams.append("dateFrom", searchCarRequest.dateFrom);
            if (searchCarRequest.dateTo) url.searchParams.append("dateTo", searchCarRequest.dateTo);
            if (searchCarRequest.country) url.searchParams.append("country", searchCarRequest.country);
            if (searchCarRequest.state) url.searchParams.append("state", searchCarRequest.state);
            if (searchCarRequest.city) url.searchParams.append("city", searchCarRequest.city);
            if (searchCarRequest.utcOffsetMinutes)
                url.searchParams.append("utcOffsetMinutes", searchCarRequest.utcOffsetMinutes.toString());
            if (searchCarRequest.brand) url.searchParams.append("brand", searchCarRequest.brand);
            if (searchCarRequest.model) url.searchParams.append("model", searchCarRequest.model);
            if (searchCarRequest.yearOfProductionFrom)
                url.searchParams.append("yearOfProductionFrom", searchCarRequest.yearOfProductionFrom);
            if (searchCarRequest.yearOfProductionTo)
                url.searchParams.append("yearOfProductionTo", searchCarRequest.yearOfProductionTo);
            if (searchCarRequest.pricePerDayInUsdFrom)
                url.searchParams.append("pricePerDayInUsdFrom", searchCarRequest.pricePerDayInUsdFrom);
            if (searchCarRequest.pricePerDayInUsdTo)
                url.searchParams.append("pricePerDayInUsdTo", searchCarRequest.pricePerDayInUsdTo);

            const apiResponse = await fetch(url);

            if (!apiResponse.ok) {
                console.error(`searchAvailableCars fetch error: + ${apiResponse.statusText}`);
                return;
            }

            const apiJson = await apiResponse.json();
            if (!Array.isArray(apiJson)) {
                console.error("searchAvailableCars fetch wrong response format:");
                return;
            }

            const availableCarsData = apiJson as SearchCarInfo[];

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
            const startDateTimeUTC = moment.utc(startDateTime).subtract(utcOffsetMinutes, "minutes").toDate();
            const endDateTimeUTC = moment.utc(endDateTime).subtract(utcOffsetMinutes, "minutes").toDate();

            const days = calculateDays(startDateTimeUTC, endDateTimeUTC);
            if (days < 0) {
                console.error("Date to' must be greater than 'Date from'");
                return false;
            }

            const startTimeUTC = getBlockchainTimeFromDate(startDateTimeUTC);
            const endTimeUTC = getBlockchainTimeFromDate(endDateTimeUTC);

            const ethAddress = ethers.getAddress("0x0000000000000000000000000000000000000000");
            const paymentsNeeded = await rentalityContract.calculatePayments(BigInt(carId), BigInt(days), ethAddress);

            const tripRequest: ContractCreateTripRequest = {
                carId: BigInt(carId),
                host: host,
                startDateTime: startTimeUTC,
                endDateTime: endTimeUTC,
                startLocation: startLocation,
                endLocation: endLocation,
                totalDayPriceInUsdCents: BigInt(totalDayPriceInUsdCents),
                depositInUsdCents: BigInt(depositInUsdCents),
                currencyRate: BigInt(paymentsNeeded.currencyRate),
                currencyDecimals: BigInt(paymentsNeeded.currencyDecimals),
                currencyType: ethAddress,
            };

            const transaction = await rentalityContract.createTripRequest(tripRequest, {
                value: paymentsNeeded.totalPrice,
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
    return [isLoading, searchAvailableCars, searchResult, sortSearchResult, createTripRequest, setSearchResult] as const;
};

export default useSearchCars;
