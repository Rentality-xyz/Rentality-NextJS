import { calculateDays } from "@/utils/date";
import { useRentality } from "@/contexts/rentalityContext";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import moment from "moment";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractCreateTripRequest,
  ContractCreateTripRequestWithDelivery,
  ContractLocationInfo,
} from "@/model/blockchain/schemas";
import { isEmpty } from "@/utils/string";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";

const useCreateTripRequest = () => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();

  const createTripRequest = async (carId: number, searchCarRequest: SearchCarRequest, timeZoneId: string) => {
    if (ethereumInfo === null) {
      console.error("createTripRequest: ethereumInfo is null");
      return false;
    }
    if (rentalityContract === null) {
      console.error("createTripRequest: rentalityContract is null");
      return false;
    }

    try {
      const startCarLocalDateTime = moment.tz(searchCarRequest.dateFrom, timeZoneId).toDate();
      const endCarLocalDateTime = moment.tz(searchCarRequest.dateTo, timeZoneId).toDate();

      const days = calculateDays(startCarLocalDateTime, endCarLocalDateTime);
      if (days < 0) {
        console.error("Date to' must be greater than 'Date from'");
        return false;
      }
      const startUnixTime = getBlockchainTimeFromDate(startCarLocalDateTime);
      const endUnixTime = getBlockchainTimeFromDate(endCarLocalDateTime);

      if (
        searchCarRequest.isDeliveryToGuest ||
        !searchCarRequest.deliveryInfo.pickupLocation.isHostHomeLocation ||
        !searchCarRequest.deliveryInfo.returnLocation.isHostHomeLocation
      ) {
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
          returnLocationInfo
        );

        const pickupLocationResult = await getSignedLocationInfo(pickupLocationInfo, ethereumInfo.chainId);
        if (!pickupLocationResult.ok) {
          console.error("Sign location error");
          return false;
        }

        const returnLocationResult =
          returnLocationInfo.userAddress === pickupLocationInfo.userAddress
            ? pickupLocationResult
            : await getSignedLocationInfo(returnLocationInfo, ethereumInfo.chainId);
        if (!returnLocationResult.ok) {
          console.error("Sign location error");
          return false;
        }

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
          pickUpInfo: pickupLocationResult.value,
          returnInfo: returnLocationResult.value,
        };

        const transaction = await rentalityContract.createTripRequestWithDelivery(tripRequest, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      } else {
        const paymentsNeeded = await rentalityContract.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(days),
          ETH_DEFAULT_ADDRESS,
          emptyContractLocationInfo,
          emptyContractLocationInfo
        );

        const tripRequest: ContractCreateTripRequest = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: ETH_DEFAULT_ADDRESS,
        };

        const transaction = await rentalityContract.createTripRequest(tripRequest, {
          value: paymentsNeeded.totalPrice,
        });
        await transaction.wait();
      }

      return true;
    } catch (e) {
      console.error("createTripRequest error:" + e);
      return false;
    }
  };
  return { createTripRequest } as const;
};

export default useCreateTripRequest;
