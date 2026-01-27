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
import { logger } from "@/utils/logger";
import { toTransmissionType } from "@/model/Transmission";

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

        logger.info(
          "checkCarAvailabilityWithDelivery request",
          JSON.stringify(
            { carId, contractDateFromUTC, contractDateToUTC, contractSearchCarParams, pickUpInfo, returnInfo },
            bigIntReplacer,
            2
          )
        );

        const result = await rentalityContracts.gateway.checkCarAvailabilityWithDelivery(
          BigInt(carId),
          contractDateFromUTC,
          contractDateToUTC,
          pickUpInfo,
          returnInfo
        );
        if (!result.ok) {
          logger.error("checkCarAvailabilityWithDelivery error:" + result.error);
          return false;
        }

        const availableCarDTO = result.value;
        if (availableCarDTO) {
          validateContractAvailableCarDTO(availableCarDTO);
        }
        logger.info("availableCarDTO:", JSON.stringify(availableCarDTO, bigIntReplacer, 2));
        const carInfoResult = await rentalityContracts.gateway.getCarInfoById(BigInt(carId));

        if (!carInfoResult.ok) {
          logger.error("checkCarAvailabilityWithDelivery error:" + carInfoResult.error);
          return false;
        }
        const tankVolumeInGal =
          availableCarDTO.engineType === EngineType.PETROL ? Number(carInfoResult.value.carInfo.engineParams[0]) : 0;

        const pricePer10PercentFuel =
          availableCarDTO.engineType === EngineType.PETROL
            ? (Number(availableCarDTO.fuelPrice) * tankVolumeInGal) / 1000
            : Number(availableCarDTO.fuelPrice) / 1000;

        const metaData = parseMetaData(await getMetaDataFromIpfs(availableCarDTO.metadataURI));
        let isCarDetailsConfirmed = false;

        const tripDays = Number(availableCarDTO.tripDays);
        const pricePerDay = Number(availableCarDTO.pricePerDayInUsdCents) / 100;
        const totalPriceWithHostDiscount = Number(availableCarDTO.totalPriceWithDiscount) / 100;
        const salesTax = Number(availableCarDTO.taxes.find((i) => i.name.includes("sale"))?.value ?? 0) / 100;
        const governmentTax =
          Number(availableCarDTO.taxes.find((i) => i.name.includes("government"))?.value ?? 0) / 100;

        const selectedCarDetails: SearchCarInfoDetails = {
          carId: Number(availableCarDTO.carId),
          ownerAddress: availableCarDTO.host.toString(),
          images: getIpfsURIs(metaData.images),
          brand: availableCarDTO.brand,
          model: availableCarDTO.model,
          year: availableCarDTO.yearOfProduction.toString(),
          doorsNumber: Number(metaData.doorsNumber),
          seatsNumber: Number(metaData.seatsNumber),
          transmission: toTransmissionType(metaData.transmission),
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
          taxes: Number(availableCarDTO.totalTax) / 100,
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
          distanceToUser: Number(availableCarDTO.distance),
          dimoTokenId: Number(availableCarDTO.dimoTokenId ? availableCarDTO.dimoTokenId : 0),
          salesTax: salesTax,
          governmentTax: governmentTax,
          currency: {
            currency: availableCarDTO.hostCurrency.currency,
            name: availableCarDTO.hostCurrency.name,
            initialized: availableCarDTO.hostCurrency.initialized,
          },
          priceInCurrency: 0,
          totalPriceInCurrency: 0,
        };
        setCarInfo(selectedCarDetails);

        return true;
      } catch (error) {
        logger.error("checkCarAvailabilityWithDelivery error:" + error);
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
