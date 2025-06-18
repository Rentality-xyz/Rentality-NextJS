import { log } from "@graphprotocol/graph-ts";
import { RentalityEvent } from "../../generated/RentalityNotificationService/RentalityNotificationService";
import { InsuranceInfo, TripEntity } from "../../generated/schema";
import { getRentalityGateway } from "./helpers";


export function handleSaveTripInsuranceEvents(event: RentalityEvent): void {
    switch (event.params.objectStatus) {
      default: handleSaveTripInsuranceEvent(event);
      break;
  
  }
  }
  export function handleSaveTripInsuranceEvent(event: RentalityEvent): void {
      let tripIdStr = event.params.id.toString()
    
      let entity = TripEntity.load(tripIdStr);
  
      if (entity == null) {
        log.warning("get trip error reverted for trip: {}", [event.params.id.toString()]);
      return;
      }
      let contract = getRentalityGateway();
      let tripDTOResult = contract.try_getTrip(event.params.id)
      if (tripDTOResult.reverted) {
          log.warning("getTrip reverted for tripId: {}", [event.params.id.toString()]);
          return;
        }
        let tripDTO = tripDTOResult.value;
          let insurances: string[] = [];
          for (let i = 0; i < tripDTO.insurancesInfo.length; i++) {
            let insuranceId = tripDTO.insurancesInfo[i].createdTime.toString() + tripDTO.insurancesInfo[i].companyName;
            insurances.push(insuranceId);
            let tripInsurance = new InsuranceInfo(insuranceId);
            tripInsurance.comment = tripDTO.insurancesInfo[i].comment;
            tripInsurance.companyName = tripDTO.insurancesInfo[i].companyName;
            tripInsurance.policyNumber = tripDTO.insurancesInfo[i].policyNumber;
            tripInsurance.createdTime = tripDTO.insurancesInfo[i].createdTime;
            tripInsurance.insuranceType = tripDTO.insurancesInfo[i].insuranceType;
            tripInsurance.photo = tripDTO.insurancesInfo[i].photo;
            tripInsurance.save();
        }
          entity.insuranceInfo = insurances;
          entity.save();
         
    }