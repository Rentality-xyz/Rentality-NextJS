import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { CarClaim, CarInfo, CarTrip, CarUser, ClaimInfo, ClaimTypeV2, InsuranceCarInfo, LocationInfo, TaxesEntity, TripEntity, UserCurrencyDTOEntity, UserProfileEntity } from "../../generated/schema"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";
import { getAdminService, getRentalityGateway, notImplemented, TaxesLocationType } from "./helpers";
import { DEFAULT_CURRENCY } from "./userCurrencyHandler";
import { RentalityAdminGateway__getAllClaimTypesResultClaimTypesStruct } from "../../generated/RentalityNotificationService/RentalityAdminGateway";



export function handleClaimvents(event: RentalityEvent): void {
    handleUpdateClaimEvent(event);
}

function handleUpdateClaimEvent(event: RentalityEvent): void {

  let entity = ClaimInfo.load(event.params.id.toString());
  let newClaim = false;
  if (entity == null) {
    entity == new ClaimInfo(event.params.id.toString());
    newClaim = true;
    return;
  }
  let contract = getRentalityGateway();
  let claimInfoResult = contract.try_getClaim(event.params.id);

  if (claimInfoResult.reverted) {
    log.warning("getClaim reverted for claimId: {}", [event.params.id.toString()]);
    return;
  } 
  
  entity.amountInEth = claimInfoResult.value.amountInEth;
  entity.amountInUsdCents = claimInfoResult.value.claim.amountInUsdCents;
  entity.claimType = claimInfoResult.value.claim.claimType;
  entity.deadlineDateInSec = claimInfoResult.value.claim.deadlineDateInSec;
  entity.description = claimInfoResult.value.claim.description;
  entity.trip = claimInfoResult.value.claim.tripId.toString();
  entity.status = claimInfoResult.value.claim.status;
  entity.claimTypeV2 = claimInfoResult.value.claimType.claimType.toString();
  entity.payDateInSec = claimInfoResult.value.claim.payDateInSec;
  entity.rejectedBy = claimInfoResult.value.claim.rejectedBy.toHexString();
  entity.rejectedDateInSec = claimInfoResult.value.claim.rejectedDateInSec;
  entity.photosUrl = claimInfoResult.value.claim.photosUrl;
  entity.isHostClaims = claimInfoResult.value.claim.isHostClaims;



  if (newClaim) {
  let carClaimId = claimInfoResult.value.carInfo.carId.toString()
  let carClaim = CarClaim.load(carClaimId);
  if (carClaim == null) {
  carClaim = new CarClaim(carClaimId);
  carClaim.car = carClaimId
  carClaim.claims = [];
}
  const hClaims = carClaim.claims;
  hClaims.push(event.params.id.toString()); 
  carClaim.claims = hClaims; 

  carClaim.save();
}


  let insuranceClaims = contract.try_getHostInsuranceClaims();
  if (insuranceClaims.reverted) {
    log.warning("getHostInsuranceClaims reverted for claimId: {}", [event.params.id.toString()]);
    return;
  }
  for (let i = 0; i < insuranceClaims.value.length; i++) { 
    if( insuranceClaims.value[i].claimId.toString() == claimInfoResult.value.claim.claimId.toString()) {
      entity.isInsuranceClaim = true;
      break;
  }
}

  entity.save();


}



export function handleAddClaimTypeEvent(event: RentalityEvent): void {

    let contract = getAdminService()
    let allClaimTypes:Array<RentalityAdminGateway__getAllClaimTypesResultClaimTypesStruct>;
    let claimTypes = contract.try_getAllClaimTypes(false);

    if (claimTypes.reverted) {
      log.warning("getAllClaimTypes reverted for claimTypeId: {}", [event.params.id.toString()]);
      return;
    }
    allClaimTypes = claimTypes.value;
    let claimTypesHost = contract.try_getAllClaimTypes(true);

    if (claimTypesHost.reverted) {
      log.warning("getAllClaimTypes reverted for claimTypeId: {}", [event.params.id.toString()]);
      return;
    }
    allClaimTypes.concat(claimTypesHost.value);


    for (let i = 0; i < allClaimTypes.length; i++) {
        if (allClaimTypes[i].claimType.toString() == event.params.id.toString()) {
          let entity = new ClaimTypeV2(i.toString());
            entity.claimType = allClaimTypes[i].claimType;
            entity.claimName = allClaimTypes[i].claimName;
            entity.creator = allClaimTypes[i].creator;
            entity.save();
            return;
        }
    } 

  }