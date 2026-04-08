import { Address, log } from "@graphprotocol/graph-ts";
import {RentalityEvent,RentalityGateway} from "../../generated/RentalityNotificationService/RentalityGateway";
import { RentalityUserService } from "../../generated/RentalityNotificationService/RentalityUserService";
import { RentalityTripService } from "../../generated/RentalityNotificationService/RentalityTripService";
export function getRentalityGateway(): RentalityGateway {
    let contract = RentalityGateway.bind(Address.fromString("0x36b58F5C1969B7b6591D752ea6F5486D069010AB"));
    return contract;
  }

  export function getRentalityTripsService(): RentalityTripService {
    let contract = RentalityTripService.bind(Address.fromString("0x4c5859f0F772848b2D91F1D83E2Fe57935348029"));
    return contract;
  }

  export function getUserService(): RentalityUserService {
    let contract = RentalityUserService.bind(Address.fromString("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"));
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
