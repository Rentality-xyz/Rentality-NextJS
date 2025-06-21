import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { BaseDiscountEntity, CarInfo, DeliveryPricesEntity, LocationInfo, PaymentInfoEntity, TripEntity, UserProfileEntity } from "../../generated/schema"
import { getRentalityGateway, notImplemented } from "./helpers"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";
export const DEFAULT_DISCOUNT_PRICE: string = '0x0000000000000000000000000000000000000000';

export function hanldeDiscountEvents(event: RentalityEvent): void {
  switch (event.params.objectStatus) {
    case 0: handleUserDiscountPrice(event);
      break;
    case 1: handleAdminDiscountPrice(event);
      break;
    default: notImplemented(event);
    break;

}
}

export function handleUserDiscountPrice(event: RentalityEvent): void {

  if( BaseDiscountEntity.load(DEFAULT_DISCOUNT_PRICE) == null) {
    handleAdminDiscountPrice(event);
  }
  let contract = getRentalityGateway();
  let discountPrices = contract.try_getDiscount(event.params.from)

  if (discountPrices.reverted) {
    log.warning("getUserDiscount reverted for user: {}", [event.params.from.toHexString()]);
    return;
  } 
  let userDiscount = BaseDiscountEntity.load(event.params.from.toHexString());
  if( userDiscount == null) {
    userDiscount = new BaseDiscountEntity(event.params.from.toHexString());
  }
  userDiscount.initialized = true;
  userDiscount.sevenDaysDiscount = discountPrices.value.sevenDaysDiscount;
  userDiscount.threeDaysDiscount = discountPrices.value.threeDaysDiscount;
  userDiscount.thirtyDaysDiscount = discountPrices.value.thirtyDaysDiscount;
  userDiscount.user = event.params.from.toHexString();

    let user = UserProfileEntity.load(event.params.from.toHexString());
      if (user == null) {
        log.error("User profile not found for user: {}", [event.params.from.toHexString()]);
        return;
      }
      user.deliveryPrice = userDiscount.id;
      user.save()
  
  userDiscount.save();
}

function handleAdminDiscountPrice(event: RentalityEvent): void {

  
    let contract = getRentalityGateway();
    let discountPrices = contract.try_getDiscount(Address.fromString(DEFAULT_DISCOUNT_PRICE))
  
    if (discountPrices.reverted) {
      log.warning("getUserDiscount reverted for user: {}", [event.params.from.toHexString()]);
      return;
    } 
    let userDiscount = BaseDiscountEntity.load(DEFAULT_DISCOUNT_PRICE);
    if( userDiscount == null) {
      userDiscount = new BaseDiscountEntity(DEFAULT_DISCOUNT_PRICE);
    }
    userDiscount.initialized = true;
    userDiscount.sevenDaysDiscount = discountPrices.value.sevenDaysDiscount;
    userDiscount.threeDaysDiscount = discountPrices.value.threeDaysDiscount;
    userDiscount.thirtyDaysDiscount = discountPrices.value.thirtyDaysDiscount;
    userDiscount.user = DEFAULT_DISCOUNT_PRICE;
    
    userDiscount.save();
  }
  