import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { BaseDiscountEntity, CarInfo, CarUser, DeliveryPricesEntity, LocationInfo, PaymentInfoEntity, TripEntity, UserCurrencyDTOEntity, UserProfileEntity } from "../../generated/schema"
import { getRentalityGateway, notImplemented } from "./helpers"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";
export const DEFAULT_CURRENCY = '0x0000000000000000000000000000000000000000';

export function handlerCurrencyEvent(event: RentalityEvent): void {
  switch (event.params.objectStatus) {
    case 0: handleUserCurrency(event);
      break;
    case 1: handleAdminCurrency(event);
      break;
    default: notImplemented(event);
    break;

}
}

function handleUserCurrency(event: RentalityEvent): void {

  let contract = getRentalityGateway();
  let userCurrency = contract.try_getUserCurrency(event.params.from)

  if (userCurrency.reverted) {
    log.warning("getUserCurrency reverted for user: {}", [event.params.from.toHexString()]);
    return;
  } 
  let userCurrencyEntity = UserCurrencyDTOEntity.load(event.params.from.toHexString());
  if( userCurrencyEntity == null) {
    userCurrencyEntity = new UserCurrencyDTOEntity(event.params.from.toHexString());
  }
  userCurrencyEntity.initialized = true;
  userCurrencyEntity.currency = userCurrency.value.currency;
  userCurrencyEntity.user = event.params.from.toHexString();
  userCurrencyEntity.name = userCurrency.value.name;

  let user = UserProfileEntity.load(event.params.from.toHexString());
  if (user == null) {
    log.error("User profile not found for user: {}", [event.params.from.toHexString()]);
    return;
  }
  user.userCurrency = userCurrencyEntity.id;
  user.save()


  userCurrencyEntity.save();
}

function handleAdminCurrency(event: RentalityEvent): void {

  
    let contract = getRentalityGateway();
    let userCurrency = contract.try_getUserCurrency(Address.fromString(DEFAULT_CURRENCY))
  
    if (userCurrency.reverted) {
      log.warning("getUserCurrency reverted for user: {}", [event.params.from.toHexString()]);
      return;
    } 
    let userCurrencyEntity = UserCurrencyDTOEntity.load(DEFAULT_CURRENCY);
    if( userCurrencyEntity == null) {
      userCurrencyEntity = new UserCurrencyDTOEntity(DEFAULT_CURRENCY);
    }
    userCurrencyEntity.initialized = true;
    userCurrencyEntity.currency = userCurrency.value.currency;
    userCurrencyEntity.user = DEFAULT_CURRENCY;
    userCurrencyEntity.name = userCurrency.value.name;
  
  
    userCurrencyEntity.save();
  }
  