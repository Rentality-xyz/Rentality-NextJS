import { CarInfo, InsuranceCarInfo, LocationInfo, TripEntity, UserCurrencyDTOEntity, UserProfileEntity } from "../../generated/schema"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";
import { getRentalityGateway, getUserService, notImplemented } from "./helpers";
import { BigInt, bigInt, log } from "@graphprotocol/graph-ts";
import { DEFAULT_CURRENCY, handleUserCurrency } from "./userCurrencyHandler";
import { DEFAULT_DELIVERY_PRICE, handleUserDeliveryPrice } from "./deliveryPriceHandler";
import { DEFAULT_DISCOUNT_PRICE, handleUserDiscountPrice } from "./discountPriceHandler";


export function handleUserEvent(event: RentalityEvent): void {
   initializeEmpty()
    let userEntity = UserProfileEntity.load(event.params.from.toHexString());
    let newProfile = false;
    if (userEntity == null) {
    userEntity = new UserProfileEntity(event.params.from.toHexString());
    newProfile = true;
    }
    if(newProfile) {
        handleUserDeliveryPrice(event);
        handleUserCurrency(event);
        handleUserDiscountPrice(event);
    }
    
    const contract = getUserService();
    const userProfile = contract.try_getKYCInfo(event.params.from);
    if (userProfile.reverted) {
      log.warning("getKYCInfo reverted for user: {}", [event.params.from.toHexString()]);
      return;
    }
  
  userEntity.createDate = userProfile.value.createDate;
  userEntity.name = userProfile.value.name;
  userEntity.profilePhoto = userProfile.value.profilePhoto;
  userEntity.surname = userProfile.value.surname;
  userEntity.mobilePhoneNumber = userProfile.value.mobilePhoneNumber;
  userEntity.licenseNumber = userProfile.value.licenseNumber;
  userEntity.expirationDate = userProfile.value.expirationDate;

  userEntity.save();

}

function initializeEmpty():void {
  if(UserProfileEntity.load(DEFAULT_CURRENCY) == null) {
    let entity = new UserProfileEntity(DEFAULT_CURRENCY)
    
    entity.userCurrency = DEFAULT_CURRENCY;

  
    entity.deliveryPrice = DEFAULT_DELIVERY_PRICE;
    entity.discountPrice = DEFAULT_DISCOUNT_PRICE;
      
    entity.createDate = new BigInt(0);
    entity.name = "";
    entity.profilePhoto = "";
    entity.surname = "";
    entity.mobilePhoneNumber = "";
    entity.licenseNumber = "";
    entity.expirationDate = new BigInt(0);
    entity.save()
  }
}
