import { parseDateIntervalWithDSTCorrection } from "@/utils/date";
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
import { formatEther } from "viem";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { logger } from "@/utils/logger";
import { UserCurrencyDTO } from "@/model/SearchCarsResult";
import { Signer } from "ethers";
import { getErc20ContractWithPaymentsAddress } from "@/abis";
import { IERC20Contract } from "@/features/blockchain/models/IErc20";
import { formatCurrencyWithSigner } from "@/utils/formatCurrency";
import approve from "@/utils/approveERC20";
import findBestPool from "@/utils/findBestPool";
import { never } from "zod";

const useCreateTripRequest = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  async function createTripRequest(
    carId: number,
    searchCarRequest: SearchCarRequest,
    timeZoneId: string,
    promoCode: string,
    userCurrency: UserCurrencyDTO
  ): Promise<Result<boolean, Error>> {
    let paymentCurrency = "0xB24DaDAe370Ff7C9492FA0d1DE99FdfF019Ca46B";
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

    
    
        if (
          !(await isUserHasEnoughFunds(ethereumInfo.signer,  paymentsResult.value.totalPrice, {
            currency: userCurrency.currency,
            name: userCurrency.name,
          }))
        ) {
          logger.error("createTripRequest error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }
        let value =  paymentsResult.value.totalPrice;
        if (userCurrency.currency !== ETH_DEFAULT_ADDRESS && userCurrency.currency === paymentCurrency) {
          await approve(userCurrency.currency, ethereumInfo.signer, BigInt(value));
          value = BigInt(0);
        }
        else if (userCurrency.currency !== paymentCurrency) {
        let quoteResult = await findBestPool(paymentCurrency, ETH_DEFAULT_ADDRESS, value, ethereumInfo.signer)
        if(!quoteResult) {
         logger.error("Fail to get quote.")
          return Err(new Error("Fail to get quote"));
        }
        console.log("VALUE: ", value)
        console.log("AMOUNT IN: ",quoteResult.amountIn )
      
        await approve(tokenIn, ethereumInfo.signer, quoteResult.amountIn);
        value = BigInt(0);

      }
        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: tokenIn,
          pickUpInfo: pickupLocationResult.value,
          returnInfo: returnLocationResult.value,
          amountIn: quoteResult.amountIn,
          fee: BigInt(quoteResult.fee)
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

    

        if (
          !(await isUserHasEnoughFunds(ethereumInfo.signer, paymentsResult.value.totalPrice, {
            currency: userCurrency.currency,
            name: userCurrency.name,
          }))
        ) {
          logger.error("createTripRequest error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        let value = paymentsResult.value.totalPrice;
        // if (userCurrency.currency !== ETH_DEFAULT_ADDRESS) {
        //   const tx = await approve(userCurrency.currency, ethereumInfo.signer, BigInt(paymentsResult.value.totalPrice));
        //   value = BigInt(0);
        // }
        let quoteResult = await findBestPool(tokenIn, ETH_DEFAULT_ADDRESS, value, ethereumInfo.signer)
        if(!quoteResult) {
         logger.error("Fail to get quote.")
          return Err(new Error("Fail to get quote"));
        }
        console.log("VALUEVALUE: ", value)
        console.log("AMOUNT IN: ",quoteResult.amountIn )
        await approve(tokenIn, ethereumInfo.signer, quoteResult.amountIn);
        value = BigInt(0);

        const tripRequest: ContractCreateTripRequestWithDelivery = {
          carId: BigInt(carId),
          startDateTime: startUnixTime,
          endDateTime: endUnixTime,
          currencyType: tokenIn,
          pickUpInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
          returnInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
          amountIn: quoteResult.amountIn,
          fee: BigInt(quoteResult.fee)
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
