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
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";
import moment from "moment";
import { formatEther } from "viem";
import { isUserHasEnoughFunds } from "@/utils/wallet";

const useCreateTripRequest = () => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();

  async function createTripRequest(
    carId: number,
    searchCarRequest: SearchCarRequest,
    timeZoneId: string,
    promoCode: string
  ): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("createTripRequest error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContract) {
      console.error("createTripRequest error: rentalityContract is null");
      return Err("ERROR");
    }

    promoCode = !isEmpty(promoCode) ? promoCode : EMPTY_PROMOCODE;
    const notEmtpyTimeZoneId = !isEmpty(timeZoneId) ? timeZoneId : UTC_TIME_ZONE_ID;
    const dateFrom = moment.tz(searchCarRequest.dateFromInDateTimeStringFormat, notEmtpyTimeZoneId).toDate();
    const dateTo = moment.tz(searchCarRequest.dateToInDateTimeStringFormat, notEmtpyTimeZoneId).toDate();

    const days = calculateDays(dateFrom, dateTo);
    if (days < 0) {
      console.error("Date to' must be greater than 'Date from'");
      return Err("ERROR");
    }
    const startUnixTime = getBlockchainTimeFromDate(dateFrom);
    const endUnixTime = getBlockchainTimeFromDate(dateTo);

    const carDeliveryData = await rentalityContract.getDeliveryData(BigInt(carId));
    const carLocationInfo: ContractLocationInfo = {
      userAddress: carDeliveryData.locationInfo.userAddress,
      country: carDeliveryData.locationInfo.country,
      state: carDeliveryData.locationInfo.state,
      city: carDeliveryData.locationInfo.city,
      latitude: carDeliveryData.locationInfo.latitude,
      longitude: carDeliveryData.locationInfo.longitude,
      timeZoneId: carDeliveryData.locationInfo.timeZoneId,
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

        const paymentsNeeded = await rentalityContract.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS,
          pickupLocationInfo,
          returnLocationInfo,
          promoCode
        );

        const pickupLocationResult = await getSignedLocationInfo(pickupLocationInfo, ethereumInfo.chainId);
        if (!pickupLocationResult.ok) {
          console.error("Sign location error");
          return Err("ERROR");
        }

        const returnLocationResult =
          returnLocationInfo.userAddress === pickupLocationInfo.userAddress
            ? pickupLocationResult
            : await getSignedLocationInfo(returnLocationInfo, ethereumInfo.chainId);
        if (!returnLocationResult.ok) {
          console.error("Sign location error");
          return Err("ERROR");
        }

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
          pickUpInfo: pickupLocationResult.value,
          returnInfo: returnLocationResult.value,
        };
        const totalPriceInEth = Number(formatEther(paymentsNeeded.totalPrice));

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer, totalPriceInEth))) {
          console.error("createTripRequest error: user don't have enough funds");
          return Err("NOT_ENOUGH_FUNDS");
        }

        const transaction = await rentalityContract.createTripRequestWithDelivery(tripRequest, promoCode, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      } else {
        const paymentsNeeded = await rentalityContract.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS,
          emptyContractLocationInfo,
          emptyContractLocationInfo,
          promoCode
        );

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
          pickUpInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
          returnInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
        };

        const totalPriceInEth = Number(formatEther(paymentsNeeded.totalPrice));

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer, totalPriceInEth))) {
          console.error("createTripRequest error: user don't have enough funds");
          return Err("NOT_ENOUGH_FUNDS");
        }
        const transaction = await rentalityContract.createTripRequestWithDelivery(tripRequest, promoCode, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      }

      return Ok(true);
    } catch (e) {
      console.error("createTripRequest error:" + e);
      return Err("ERROR");
    }
  }

  return { createTripRequest } as const;
};

export default useCreateTripRequest;
