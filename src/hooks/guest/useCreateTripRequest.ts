import { parseDateIntervalWithDSTCorrection } from "@/utils/date";
import { useRentality } from "@/contexts/rentalityContext";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateTripRequestWithDelivery, ContractLocationInfo } from "@/model/blockchain/schemas";
import { isEmpty } from "@/utils/string";
import { EMPTY_PROMOCODE, ETH_DEFAULT_ADDRESS, WETH_ADDRESS } from "@/utils/constants";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { SearchCarRequest } from "@/model/SearchCarRequest";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { formatEther } from "viem";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { logger } from "@/utils/logger";
import { SearchCarInfo, UserCurrencyDTO } from "@/model/SearchCarsResult";
import approve from "@/utils/approveERC20";
import findBestPool from "@/utils/findBestPool";


const useCreateTripRequest = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  async function createTripRequest(
    carId: number,
    searchCarRequest: SearchCarRequest,
    timeZoneId: string,
    promoCode: string,
    userCurrency: UserCurrencyDTO,
    paymentCurrency: string = userCurrency.currency,
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

    const { dateFrom, dateTo, totalDays } = parseDateIntervalWithDSTCorrection(
      searchCarRequest.dateFromInDateTimeStringFormat,
      searchCarRequest.dateToInDateTimeStringFormat,
      timeZoneId
    );

    if (totalDays < 0) {
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
          BigInt(totalDays),
          userCurrency.currency,
          pickupLocationInfo,
          returnLocationInfo,
          promoCode
        );
        if (!paymentsResult.ok) {
          return Err(new Error("ERROR"));
        }

        const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
        if(!defaultChainId) {
          console.error("Default chain id not found")
          return Err(new Error("ERROR"));
        }
        const pickupLocationResult = await getSignedLocationInfo(pickupLocationInfo, Number.parseInt(defaultChainId));
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

    
        let amountIn = 0;
        let fee = 0;
 
        let value =  paymentsResult.value.totalPrice;
        if (userCurrency.currency !== ETH_DEFAULT_ADDRESS && userCurrency.currency === paymentCurrency) {
          await approve(userCurrency.currency, ethereumInfo.signer, BigInt(value));
          value = BigInt(0);
        }
        else if (userCurrency.currency !== paymentCurrency) {
        const tokenTo = userCurrency.currency === ETH_DEFAULT_ADDRESS ? WETH_ADDRESS : userCurrency.currency;
        let quoteResult = await findBestPool(paymentCurrency, tokenTo, value, ethereumInfo.signer)
        if(!quoteResult) {
         logger.error("Fail to get quote.")
          return Err(new Error("Fail to get quote"));
        }
      if (paymentCurrency !== ETH_DEFAULT_ADDRESS) {
        await approve(paymentCurrency, ethereumInfo.signer, quoteResult.amountIn);
        value = BigInt(0);
      }
      else {
        value = quoteResult.amountIn
      }
        amountIn = quoteResult.amountIn;
        fee = quoteResult.fee;

      }
        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: paymentCurrency,
          pickUpInfo: pickupLocationResult.value,
          returnInfo: returnLocationResult.value,
          amountIn: BigInt(amountIn),
          fee: BigInt(fee)
        };
        const result = await rentalityContracts.gateway.createTripRequestWithDelivery(tripRequest, promoCode, {
          value,
        });
        if (!result.ok) {
          return Err(new Error("ERROR"));
        }
      
      } else {
        const paymentsResult = await rentalityContracts.gateway.calculatePaymentsWithDelivery(
          BigInt(carId),
          BigInt(totalDays),
          userCurrency.currency,
          emptyContractLocationInfo,
          emptyContractLocationInfo,
          promoCode
        );
        if (!paymentsResult.ok) {
          return Err(new Error("ERROR"));
        }

    
        let value = paymentsResult.value.totalPrice;
        let amountIn = 0;
        let fee = 0;
        if (userCurrency.currency !== ETH_DEFAULT_ADDRESS && userCurrency.currency === paymentCurrency) {
          const tx = await approve(userCurrency.currency, ethereumInfo.signer, BigInt(paymentsResult.value.totalPrice));
          value = BigInt(0);
        }
        else if (userCurrency.currency !== paymentCurrency) {
          const tokenTo = userCurrency.currency === ETH_DEFAULT_ADDRESS ? WETH_ADDRESS : userCurrency.currency;
          let quoteResult = await findBestPool(paymentCurrency, tokenTo, value, ethereumInfo.signer)
          if(!quoteResult) {
           logger.error("Fail to get quote.")
            return Err(new Error("Fail to get quote"));
          }
        if (paymentCurrency !== ETH_DEFAULT_ADDRESS) {
          await approve(paymentCurrency, ethereumInfo.signer, quoteResult.amountIn);
          value = BigInt(0);
        }
        else {
          value = quoteResult.amountIn
        }
          amountIn = quoteResult.amountIn;
          fee = quoteResult.fee;
  
        }
        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: paymentCurrency,
          pickUpInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
          returnInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
          amountIn: BigInt(amountIn),
          fee: BigInt(fee)
        };

        const result = await rentalityContracts.gateway.createTripRequestWithDelivery(tripRequest, promoCode, {
          value,
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
