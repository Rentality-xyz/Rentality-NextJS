import { calculateDays, UTC_TIME_ZONE_ID } from "@/utils/date";
import { useRentality } from "@/contexts/rentalityContext";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateTripRequestWithDelivery, ContractLocationInfo } from "@/model/blockchain/schemas";
import { isEmpty } from "@/utils/string";
import { EMPTY_PROMOCODE, ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import moment from "moment";
import { formatEther } from "viem";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { logger } from "@/utils/logger";

const useCreateTripRequest = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  async function createTripRequest(
    carId: number,
    searchCarRequest: SearchCarRequest,
    timeZoneId: string,
    promoCode: string
  ): Promise<Result<boolean, Error>> {
    if (!ethereumInfo) {
      logger.error("createTripRequest error: ethereumInfo is null");
      return Err(new Error("ERROR"));
    }

    if (!rentalityContracts) {
      logger.error("createTripRequest error: rentalityContract is null");
      return Err(new Error("ERROR"));
    }

    promoCode = !isEmpty(promoCode) ? promoCode : EMPTY_PROMOCODE;
    const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;
    const dateFrom = moment.tz(searchCarRequest.dateFromInDateTimeStringFormat, notEmtpyTimeZoneId).toDate();
    const dateTo = moment.tz(searchCarRequest.dateToInDateTimeStringFormat, notEmtpyTimeZoneId).toDate();

    const days = calculateDays(dateFrom, dateTo);
    if (days < 0) {
      logger.error("Date to' must be greater than 'Date from'");
      return Err(new Error("ERROR"));
    }
    const startUnixTime = getBlockchainTimeFromDate(dateFrom);
    const endUnixTime = getBlockchainTimeFromDate(dateTo);

    const carDeliveryDataResult = await rentalityContracts.gateway.getDeliveryData(BigInt(carId));
    if (!carDeliveryDataResult.ok) {
      logger.error("createTripRequest error: carDeliveryDataResult resutl an error: " + carDeliveryDataResult.error);
      return Err(new Error("ERROR"));
    }
    const carLocationInfo: ContractLocationInfo = {
      userAddress: carDeliveryDataResult.value.locationInfo.userAddress,
      country: carDeliveryDataResult.value.locationInfo.country,
      state: carDeliveryDataResult.value.locationInfo.state,
      city: carDeliveryDataResult.value.locationInfo.city,
      latitude: carDeliveryDataResult.value.locationInfo.latitude,
      longitude: carDeliveryDataResult.value.locationInfo.longitude,
      timeZoneId: carDeliveryDataResult.value.locationInfo.timeZoneId,
    };

    try {
      if (
        searchCarRequest.isDeliveryToGuest ||
        !searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation ||
        !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
      ) {
        const pickupLocationInfo: ContractLocationInfo =
          searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation ||
          isEmpty(searchCarRequest.deliveryInfo.pickupLocation.locationInfo.address)
            ? carLocationInfo
            : mapLocationInfoToContractLocationInfo(searchCarRequest.deliveryInfo.pickupLocation.locationInfo);
        const returnLocationInfo =
          searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation ||
          isEmpty(searchCarRequest.deliveryInfo.returnLocation.locationInfo.address)
            ? carLocationInfo
            : mapLocationInfoToContractLocationInfo(searchCarRequest.deliveryInfo.returnLocation.locationInfo);

        const paymentsResult = await rentalityContracts.gateway.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS,
          pickupLocationInfo,
          returnLocationInfo,
          promoCode
        );
        if (!paymentsResult.ok) {
          return Err(new Error("ERROR"));
        }

        const pickupLocationResult = await getSignedLocationInfo(pickupLocationInfo, ethereumInfo.chainId);
        if (!pickupLocationResult.ok) {
          logger.error("Sign location error");
          return Err(new Error("ERROR"));
        }

        const returnLocationResult =
          returnLocationInfo.userAddress === pickupLocationInfo.userAddress
            ? pickupLocationResult
            : await getSignedLocationInfo(returnLocationInfo, ethereumInfo.chainId);
        if (!returnLocationResult.ok) {
          logger.error("Sign location error");
          return Err(new Error("ERROR"));
        }

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
          pickUpInfo: pickupLocationResult.value,
          returnInfo: returnLocationResult.value,
        };
        const totalPriceInEth = Number(formatEther(paymentsResult.value.totalPrice));

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer, totalPriceInEth))) {
          logger.error("createTripRequest error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const result = await rentalityContracts.gateway.createTripRequestWithDelivery(tripRequest, promoCode, {
          value: paymentsResult.value.totalPrice,
        });
        if (!result.ok) {
          return Err(new Error("ERROR"));
        }
      } else {
        const paymentsResult = await rentalityContracts.gateway.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS,
          emptyContractLocationInfo,
          emptyContractLocationInfo,
          promoCode
        );
        if (!paymentsResult.ok) {
          return Err(new Error("ERROR"));
        }

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
          pickUpInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
          returnInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
        };

        const totalPriceInEth = Number(formatEther(paymentsResult.value.totalPrice));

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer, totalPriceInEth))) {
          logger.error("createTripRequest error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const result = await rentalityContracts.gateway.createTripRequestWithDelivery(tripRequest, promoCode, {
          value: paymentsResult.value.totalPrice,
        });
        if (!result.ok) {
          return Err(new Error("ERROR"));
        }
      }

      return Ok(true);
    } catch (error) {
      logger.error("createTripRequest error:" + error);
      return Err(new Error("ERROR"));
    }
  }

  return { createTripRequest } as const;
};

export default useCreateTripRequest;
