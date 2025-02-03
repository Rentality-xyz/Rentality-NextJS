import { useEffect, useState } from "react";
import { SearchCarInfoDetails } from "@/model/SearchCarsResult";
import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { ContractLocationInfo, EngineType } from "@/model/blockchain/schemas";
import { emptyContractLocationInfo, validateContractAvailableCarDTO } from "@/model/blockchain/schemas_utils";
import { formatLocationInfoUpToCity } from "@/model/LocationInfo";
import { getIpfsURIs, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { getMilesIncludedPerDayText } from "@/model/HostCarInfo";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";
import { bigIntReplacer } from "@/utils/json";
import { getTimeZoneIdByAddress } from "@/utils/timezone";
import { formatSearchAvailableCarsContractRequest } from "@/utils/searchMapper";

const useSearchCar = (searchCarRequest: SearchCarRequest, carId?: number) => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [carInfo, setCarInfo] = useState<SearchCarInfoDetails>();

  useEffect(() => {
    const checkCarAvailabilityWithDelivery = async (request: SearchCarRequest, carId: number) => {
      if (!rentalityContracts) return;
      if (carId === 0) return;

      try {
        setIsLoading(true);

        const timeZoneId = (await getTimeZoneIdByAddress(request.searchLocation)) ?? "";
        const { contractDateFromUTC, contractDateToUTC, contractSearchCarParams } =
          formatSearchAvailableCarsContractRequest(request, {}, timeZoneId);

        const pickUpInfo: ContractLocationInfo = {
          ...emptyContractLocationInfo,
          latitude: request.deliveryInfo.pickupLocation.isHostHomeLocation
            ? ""
            : request.deliveryInfo.pickupLocation.locationInfo.latitude.toFixed(6),
          longitude: request.deliveryInfo.pickupLocation.isHostHomeLocation
            ? ""
            : request.deliveryInfo.pickupLocation.locationInfo.longitude.toFixed(6),
        };
        const returnInfo: ContractLocationInfo = {
          ...emptyContractLocationInfo,
          latitude: request.deliveryInfo.returnLocation.isHostHomeLocation
            ? ""
            : request.deliveryInfo.returnLocation.locationInfo.latitude.toFixed(6),
          longitude: request.deliveryInfo.returnLocation.isHostHomeLocation
            ? ""
            : request.deliveryInfo.returnLocation.locationInfo.longitude.toFixed(6),
        };

        console.log(
          "checkCarAvailabilityWithDelivery request",
          JSON.stringify(
            { carId, contractDateFromUTC, contractDateToUTC, contractSearchCarParams, pickUpInfo, returnInfo },
            bigIntReplacer,
            2
          )
        );

        const availableCarDTO = await rentalityContracts.gateway.checkCarAvailabilityWithDelivery(
          BigInt(carId),
          contractDateFromUTC,
          contractDateToUTC,
          contractSearchCarParams,
          pickUpInfo,
          returnInfo
        );
        if (availableCarDTO) {
          validateContractAvailableCarDTO(availableCarDTO);
        }
        console.log("availableCarDTO:", JSON.stringify(availableCarDTO, bigIntReplacer, 2));
        const carInfo = await rentalityContracts.gateway.getCarInfoById(BigInt(carId));

        const tankVolumeInGal =
          availableCarDTO.engineType === EngineType.PETROL ? Number(carInfo.carInfo.engineParams[0]) : 0;

        const pricePer10PercentFuel =
          availableCarDTO.engineType === EngineType.PETROL
            ? (Number(availableCarDTO.fuelPrice) * tankVolumeInGal) / 1000
            : Number(availableCarDTO.fuelPrice) / 1000;

        const metaData = parseMetaData(await getMetaDataFromIpfs(availableCarDTO.metadataURI));
        let isCarDetailsConfirmed = false;

        const tripDays = Number(availableCarDTO.tripDays);
        const pricePerDay = Number(availableCarDTO.pricePerDayInUsdCents) / 100;
        const totalPriceWithHostDiscount = Number(availableCarDTO.totalPriceWithDiscount) / 100;

        const selectedCarDetails: SearchCarInfoDetails = {
          carId: Number(availableCarDTO.carId),
          ownerAddress: availableCarDTO.host.toString(),
          images: getIpfsURIs(metaData.images),
          brand: availableCarDTO.brand,
          model: availableCarDTO.model,
          year: availableCarDTO.yearOfProduction.toString(),
          doorsNumber: Number(metaData.doorsNumber),
          seatsNumber: Number(metaData.seatsNumber),
          transmission: metaData.transmission,
          engineType: availableCarDTO.engineType,
          carDescription: metaData.description,
          color: metaData.color,
          carName: metaData.name,
          tankSizeInGal: Number(metaData.tankVolumeInGal),

          milesIncludedPerDayText: getMilesIncludedPerDayText(availableCarDTO.milesIncludedPerDay ?? 0),
          pricePerDay: pricePerDay,
          pricePerDayWithHostDiscount: Number(availableCarDTO.pricePerDayWithDiscount) / 100,
          tripDays: tripDays,
          totalPriceWithHostDiscount: totalPriceWithHostDiscount,
          taxes: Number(availableCarDTO.taxes) / 100,
          securityDeposit: Number(availableCarDTO.securityDepositPerTripInUsdCents) / 100,
          hostPhotoUrl: availableCarDTO.hostPhotoUrl,
          hostName: availableCarDTO.hostName,
          timeZoneId: availableCarDTO.locationInfo.timeZoneId,
          location: {
            lat: Number(availableCarDTO.locationInfo.latitude),
            lng: Number(availableCarDTO.locationInfo.longitude),
          },
          highlighted: false,
          daysDiscount: getDaysDiscount(tripDays),
          totalDiscount: getTotalDiscount(pricePerDay, tripDays, totalPriceWithHostDiscount),
          hostHomeLocation: formatLocationInfoUpToCity(availableCarDTO.locationInfo),
          deliveryPrices: {
            from1To25milesPrice: Number(availableCarDTO.underTwentyFiveMilesInUsdCents) / 100,
            over25MilesPrice: Number(availableCarDTO.aboveTwentyFiveMilesInUsdCents) / 100,
          },
          isInsuranceIncluded: availableCarDTO.insuranceIncluded,
          deliveryDetails: {
            pickUp: {
              distanceInMiles: Number(availableCarDTO.distance ?? 0),
              priceInUsd: Number(availableCarDTO.pickUp) / 100,
            },
            dropOff: {
              distanceInMiles: Number(availableCarDTO.distance ?? 0),
              priceInUsd: Number(availableCarDTO.dropOf) / 100,
            },
          },
          isCarDetailsConfirmed: isCarDetailsConfirmed,
          isTestCar: false,
          isInsuranceRequired: availableCarDTO.insuranceInfo.required,
          insurancePerDayPriceInUsd: Number(availableCarDTO.insuranceInfo.priceInUsdCents) / 100,
          isGuestHasInsurance: availableCarDTO.isGuestHasInsurance,

          pricePer10PercentFuel: pricePer10PercentFuel,
          tripDiscounts: {
            discount3DaysAndMoreInPercents: Number(availableCarDTO.carDiscounts.threeDaysDiscount) / 10_000,
            discount7DaysAndMoreInPercents: Number(availableCarDTO.carDiscounts.sevenDaysDiscount) / 10_000,
            discount30DaysAndMoreInPercents: Number(availableCarDTO.carDiscounts.thirtyDaysDiscount) / 10_000,
          },
          salesTax: Number(availableCarDTO.salesTax) / 100,
          governmentTax: Number(availableCarDTO.governmentTax) / 100,
          distanceToUser: Number(availableCarDTO.distance),
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
    if (!rentalityContracts) return;
    if (!carId) return;
    if (isEmpty(searchCarRequest.searchLocation.address)) return;

    checkCarAvailabilityWithDelivery(searchCarRequest, carId);
  }, [ethereumInfo, rentalityContracts, searchCarRequest, carId]);

  return { isLoading, carInfo } as const;
};

function getDaysDiscount(tripDays: number) {
  switch (true) {
    case tripDays >= 30:
      return "30+ day discount";
    case tripDays >= 7:
      return "7+ day discount";
    case tripDays >= 3:
      return "3+ day discount";
    default:
      return "Days discount";
  }
}

function getTotalDiscount(pricePerDay: number, tripDays: number, totalPriceWithHostDiscount: number) {
  const totalDiscount = pricePerDay * tripDays - totalPriceWithHostDiscount;
  let result: string = "";
  if (totalDiscount > 0) {
    result = "-$" + displayMoneyWith2Digits(totalDiscount);
  } else {
    result = "-";
  }
  return result;
}

export default useSearchCar;
