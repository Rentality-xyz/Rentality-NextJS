import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { CarInfo, LocationInfo, TripEntity } from "../generated/schema"
import { handleCarEvents } from "./handlers/carHandlers";
import { handleTripEvents } from "./handlers/tripHandlers";
import { notImplemented } from "./handlers/helpers";
import { hanldeDeliveryEvents } from "./handlers/deliveryPriceHandler";
import {RentalityEvent} from "../generated/RentalityNotificationService/RentalityNotificationService";
import { handleUserEvent } from "./handlers/userHandler";
import { hanldeDiscountEvents } from "./handlers/discountPriceHandler";
import { handlerCurrencyEvent } from "./handlers/userCurrencyHandler";
import { handleUserInsurance } from "./handlers/insuranceHandler";
import { handleTaxesEvent } from "./handlers/taxHandler";
import { handleAddClaimTypeEvent, handleClaimvents } from "./handlers/claimHandler";
import { handleSaveTripInsuranceEvents } from "./handlers/tripInsuranceHandler";

export function handleRentalityEvent(event: RentalityEvent): void {
  log.info("NEW EVENT eTYPE: {}, from: {}, object status: {}",[event.params.eType.toString(), event.params.from.toHexString(), event.params.objectStatus.toString()])
 switch (event.params.eType) {
    case 0: handleCarEvents(event);
      break;
      case 1: handleClaimvents(event);
      break;
      case 2: handleTripEvents(event);
      break;
      case 3: handleUserEvent(event);
      break;
      case 4: handleUserInsurance(event);
      break;
      case 5: handleTaxesEvent(event);
      break;
      case 6: hanldeDiscountEvents(event);
      break;
      case 7: hanldeDeliveryEvents(event);
      break;
      case 8: handlerCurrencyEvent(event);
      break;
      case 9: handleAddClaimTypeEvent(event);
      break;
      case 10: handleSaveTripInsuranceEvents(event);
      break;
      default: notImplemented(event);
      break;

    
}
}
// 26966177




