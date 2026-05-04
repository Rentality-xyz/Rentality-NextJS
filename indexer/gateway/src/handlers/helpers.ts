import { Address, log } from "@graphprotocol/graph-ts";
import { RentalityGateway } from "../../generated/RentalityNotificationService/RentalityGateway";
import { RentalityEvent } from "../../generated/RentalityNotificationService/RentalityNotificationService";
import { RentalityUserService } from "../../generated/RentalityNotificationService/RentalityUserService";
import { RentalityTripService } from "../../generated/RentalityNotificationService/RentalityTripService";
import { RENTALITY_GATEWAY_ADDRESS, RENTALITY_TRIP_SERVICE_ADDRESS, RENTALITY_USER_SERVICE_ADDRESS } from "./generatedLocalhostAddresses";
export function getRentalityGateway(): RentalityGateway {
    let contract = RentalityGateway.bind(Address.fromString(RENTALITY_GATEWAY_ADDRESS));
    return contract;
  }

  export function getRentalityTripsService(): RentalityTripService {
    let contract = RentalityTripService.bind(Address.fromString(RENTALITY_TRIP_SERVICE_ADDRESS));
    return contract;
  }

  export function getUserService(): RentalityUserService {
    let contract = RentalityUserService.bind(Address.fromString(RENTALITY_USER_SERVICE_ADDRESS));
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
