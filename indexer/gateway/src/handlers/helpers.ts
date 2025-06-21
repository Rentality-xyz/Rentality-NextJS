import { Address, log } from "@graphprotocol/graph-ts";
import {RentalityGateway} from "../../generated/RentalityNotificationService/RentalityGateway";
import { RentalityUserService } from "../../generated/RentalityNotificationService/RentalityUserService";
import { RentalityTripService } from "../../generated/RentalityNotificationService/RentalityTripService";
import { RentalityAdminGateway } from "../../generated/RentalityNotificationService/RentalityAdminGateway";
import { RentalityGeoService } from "../../generated/RentalityNotificationService/RentalityGeoService";
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";

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

export function getAdminService(): RentalityAdminGateway{
  let contract = RentalityAdminGateway.bind(Address.fromString("0xE27172d322E2ba92A9cDCd17D5021B82df7B6b95"));
  return contract;
}


export function getGeoService(): RentalityGeoService{
  let contract = RentalityGeoService.bind(Address.fromString("0xb1576942d42196a5448eA93105122E4F2Bc26eb4"));
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