import { Address, log } from "@graphprotocol/graph-ts";
import {RentalityEvent,RentalityGateway} from "../../generated/RentalityNotificationService/RentalityGateway";
import { RentalityUserService } from "../../generated/RentalityNotificationService/RentalityUserService";
import { RentalityTripService } from "../../generated/RentalityNotificationService/RentalityTripService";
export function getRentalityGateway(): RentalityGateway {
    let contract = RentalityGateway.bind(Address.fromString("0xB257FE9D206b60882691a24d5dfF8Aa24929cB73"));
    return contract;
  }

  export function getRentalityTripsService(): RentalityTripService {
    let contract = RentalityTripService.bind(Address.fromString("0xDB00B0aaD3D43590232280d056DCA49d017A10c2"));
    return contract;
  }

  export function getUserService(): RentalityUserService {
    let contract = RentalityUserService.bind(Address.fromString("0xE15378Ad98796BB35cbbc116DfC70d3416B52D45"));
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