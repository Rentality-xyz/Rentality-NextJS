import { Address, log } from "@graphprotocol/graph-ts";
import {RentalityEvent,RentalityGateway} from "../../generated/RentalityNotificationService/RentalityGateway";
import { RentalityUserService } from "../../generated/RentalityNotificationService/RentalityUserService";
import { RentalityTripService } from "../../generated/RentalityNotificationService/RentalityTripService";
export function getRentalityGateway(): RentalityGateway {
    let contract = RentalityGateway.bind(Address.fromString("0xCf261b0275870d924d65d67beB9E88Ebd8deE693"));
    return contract;
  }

  export function getRentalityTripsService(): RentalityTripService {
    let contract = RentalityTripService.bind(Address.fromString("0xE400654d8310EA37953DB7A59E0C80F70Fea39F8"));
    return contract;
  }

  export function getUserService(): RentalityUserService {
    let contract = RentalityUserService.bind(Address.fromString("0x11027b8F9fD26381AF60E75E3175A5A46C0386e8"));
    return contract;
}
  
  
  export function notImplemented(event: RentalityEvent): void {
    log.warning("NOT IMPLEMENTED objectStatus: {}", [event.params.objectStatus.toString()]);
  }

  export enum TaxesLocationType {
            State = 0,
            City = 1,
            Country = 2,
  }