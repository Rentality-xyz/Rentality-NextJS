import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { CarInfo, DeliveryPricesEntity, LocationInfo, PaymentInfoEntity, TripEntity, UserProfileEntity } from "../../generated/schema"
import { getRentalityGateway, notImplemented } from "./helpers"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";
export const DEFAULT_DELIVERY_PRICE = '0x0000000000000000000000000000000000000000';
export function hanldeDeliveryEvents(event: RentalityEvent): void {
  switch (event.params.objectStatus) {
    case 0: handleUserDeliveryPrice(event);
      break;
    case 1: handleAdminDeliveryPrice(event);
      break;
    default: notImplemented(event);
    break;

}
}

export function handleUserDeliveryPrice(event: RentalityEvent): void {
  if( DeliveryPricesEntity.load(DEFAULT_DELIVERY_PRICE) == null) {
    handleAdminDeliveryPrice(event);
  }

  let contract = getRentalityGateway();
  let delivertPrices = contract.try_getUserDeliveryPrices(event.params.from)

  if (delivertPrices.reverted) {
    log.warning("getUserDeliveryPrices reverted for user: {}", [event.params.from.toHexString()]);
    return;
  } 
  let userDeliveryPriceEntity = DeliveryPricesEntity.load(event.params.from.toHexString());
  if( userDeliveryPriceEntity == null) {
    userDeliveryPriceEntity = new DeliveryPricesEntity(event.params.from.toHexString());
  }
  userDeliveryPriceEntity.aboveTwentyFiveMilesInUsdCents = delivertPrices.value.aboveTwentyFiveMilesInUsdCents;
  userDeliveryPriceEntity.underTwentyFiveMilesInUsdCents = delivertPrices.value.underTwentyFiveMilesInUsdCents;
  userDeliveryPriceEntity.user = event.params.from.toHexString();
  userDeliveryPriceEntity.initialized = true;

    let user = UserProfileEntity.load(event.params.from.toHexString());
    if (user == null) {
      log.error("User profile not found for user: {}", [event.params.from.toHexString()]);
      return;
    }
    user.deliveryPrice = userDeliveryPriceEntity.id;
    user.save()
  
  userDeliveryPriceEntity.save();
}

function handleAdminDeliveryPrice(event: RentalityEvent): void {

    let contract = getRentalityGateway();
    let delivertPrices = contract.try_getUserDeliveryPrices(Address.fromString(DEFAULT_DELIVERY_PRICE))
  
    if (delivertPrices.reverted) {
      log.warning("getUserDeliveryPrices reverted for user: {}", [event.params.from.toHexString()]);
      return;
    } 
    let userDeliveryPriceEntity = DeliveryPricesEntity.load(DEFAULT_DELIVERY_PRICE);
    if( userDeliveryPriceEntity == null) {
      userDeliveryPriceEntity = new DeliveryPricesEntity(DEFAULT_DELIVERY_PRICE);
    }
    userDeliveryPriceEntity.aboveTwentyFiveMilesInUsdCents = delivertPrices.value.aboveTwentyFiveMilesInUsdCents;
    userDeliveryPriceEntity.underTwentyFiveMilesInUsdCents = delivertPrices.value.underTwentyFiveMilesInUsdCents;
    userDeliveryPriceEntity.user = DEFAULT_DELIVERY_PRICE;
    userDeliveryPriceEntity.initialized = false;


    userDeliveryPriceEntity.save();
  }