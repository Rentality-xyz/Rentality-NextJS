import { Address, log } from "@graphprotocol/graph-ts";
import {RentalityGateway} from "../../generated/RentalityNotificationService/RentalityGateway";
import { RentalityUserService } from "../../generated/RentalityNotificationService/RentalityUserService";
import { RentalityTripService } from "../../generated/RentalityNotificationService/RentalityTripService";
import { RentalityAdminGateway } from "../../generated/RentalityNotificationService/RentalityAdminGateway";
import { RentalityGeoService } from "../../generated/RentalityNotificationService/RentalityGeoService";
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";

export function getRentalityGateway(): RentalityGateway {
    let contract = RentalityGateway.bind(Address.fromString("0x04e119c621653c2AC72Cd2177339C7D90B876807"));
    return contract;
  }

  export function getRentalityTripsService(): RentalityTripService {
    let contract = RentalityTripService.bind(Address.fromString("0xc2ADce103aDD65efE0Ec7e75AeA2fFbf686779eb"));
    return contract;
  }

  export function getUserService(): RentalityUserService {
    let contract = RentalityUserService.bind(Address.fromString("0x8Fe71EFaA1429C8677fae8C58747ef507D3Ee226"));
    return contract;
}

export function getAdminService(): RentalityAdminGateway{
  let contract = RentalityAdminGateway.bind(Address.fromString("0x8A2E197feB7852B4d829b81d2A0F75f1C7e03f53"));
  return contract;
}


export function getGeoService(): RentalityGeoService{
  let contract = RentalityGeoService.bind(Address.fromString("0x4F9fEb7b5a1E5DbddBEB99B7D6D32F09C758025A"));
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