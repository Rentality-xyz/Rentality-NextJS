import { useEffect, useState } from "react";
import { SearchCarInfoDetails, SearchCarInfoDTO } from "@/model/SearchCarsResult";
import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { EngineType, InsuranceType } from "@/model/blockchain/schemas";

const useSearchCar = (searchCarRequest: SearchCarRequest, carId?: number) => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [carInfo, setCarInfo] = useState<SearchCarInfoDetails>();

  useEffect(() => {
    const checkCarAvailabilityWithDelivery = async (request: SearchCarRequest, carId: number) => {
      if (!rentalityContract) return;

      try {
        setIsLoading(true);

        var url = new URL(`/api/publicSearchCars`, window.location.origin);
        if (ethereumInfo?.chainId) url.searchParams.append("chainId", ethereumInfo.chainId.toString());
        if (request.dateFrom) url.searchParams.append("dateFrom", request.dateFrom.toISOString());
        if (request.dateTo) url.searchParams.append("dateTo", request.dateTo.toISOString());
        if (request.searchLocation.country) url.searchParams.append("country", request.searchLocation.country);
        if (request.searchLocation.state) url.searchParams.append("state", request.searchLocation.state);
        if (request.searchLocation.city) url.searchParams.append("city", request.searchLocation.city);
        url.searchParams.append("latitude", request.searchLocation.latitude.toFixed(6));
        url.searchParams.append("longitude", request.searchLocation.longitude.toFixed(6));

        if (request.isDeliveryToGuest)
          url.searchParams.append("isDeliveryToGuest", request.isDeliveryToGuest ? "true" : "false");
        if (
          request.isDeliveryToGuest &&
          !request.deliveryInfo.pickupLocation.isHostHomeLocation &&
          !isEmpty(request.deliveryInfo.pickupLocation.locationInfo.address)
        )
          url.searchParams.append(
            "pickupLocation",
            `${request.deliveryInfo.pickupLocation.locationInfo.latitude.toFixed(6)};${request.deliveryInfo.pickupLocation.locationInfo.longitude.toFixed(6)}`
          );
        if (
          request.isDeliveryToGuest &&
          !request.deliveryInfo.returnLocation.isHostHomeLocation &&
          !isEmpty(request.deliveryInfo.returnLocation.locationInfo.address)
        )
          url.searchParams.append(
            "returnLocation",
            `${request.deliveryInfo.returnLocation.locationInfo.latitude.toFixed(6)};${request.deliveryInfo.returnLocation.locationInfo.longitude.toFixed(6)}`
          );

        const apiResponse = await fetch(url);

        if (!apiResponse.ok) {
          console.error(`checkCarAvailabilityWithDelivery fetch error: + ${apiResponse.statusText}`);
          return;
        }

        const apiJson = await apiResponse.json();
        if (!Array.isArray(apiJson)) {
          console.error("checkCarAvailabilityWithDelivery fetch wrong response format:");
          return;
        }

        const availableCarsData = apiJson as SearchCarInfoDTO[];
        const selectedCar = availableCarsData.find((i) => i.carId === carId);
        if (!selectedCar) {
          console.error("checkCarAvailabilityWithDelivery error: selectedCar was not found");
          return false;
        }

        const discounts = await rentalityContract.getDiscount(selectedCar.ownerAddress);
        const insurancesView = await rentalityContract.getMyInsurancesAsGuest();
        const generalInsurances = insurancesView.filter((i) => i.insuranceType === InsuranceType.General);

        const carInfo = await rentalityContract.getCarInfoById(BigInt(carId));

        const tankVolumeInGal =
          carInfo.carInfo.engineType === EngineType.PETROL ? Number(carInfo.carInfo.engineParams[0]) : 0;

        const pricePer10PercentFuel =
          carInfo.carInfo.engineType === EngineType.PETROL
            ? (Number(carInfo.carInfo.engineParams[1]) * tankVolumeInGal) / 1000
            : Number(carInfo.carInfo.engineParams[0]) / 1000;

        const selectedCarDetails: SearchCarInfoDetails = {
          ...selectedCar,
          engineType: BigInt(selectedCar.engineType),
          pricePer10PercentFuel: pricePer10PercentFuel,
          tripDiscounts: {
            discount3DaysAndMoreInPercents: Number(discounts.threeDaysDiscount) / 10_000,
            discount7DaysAndMoreInPercents: Number(discounts.sevenDaysDiscount) / 10_000,
            discount30DaysAndMoreInPercents: Number(discounts.thirtyDaysDiscount) / 10_000,
          },
          salesTax: 12,
          governmentTax: 34,
          isGuestHasInsurance: generalInsurances.length > 0,
        };
        setCarInfo(selectedCarDetails);

        return true;
      } catch (e) {
        console.error("checkCarAvailabilityWithDelivery error:" + e);
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    if (!ethereumInfo) return;
    if (!rentalityContract) return;
    if (!carId) return;
    if (isEmpty(searchCarRequest.searchLocation.address)) return;

    checkCarAvailabilityWithDelivery(searchCarRequest, carId);
  }, [ethereumInfo, rentalityContract, searchCarRequest, carId]);

  return { isLoading, carInfo } as const;
};

export default useSearchCar;
