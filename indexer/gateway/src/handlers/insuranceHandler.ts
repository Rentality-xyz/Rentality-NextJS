import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { CarInfo, GuestInsurancesEntity, InsuranceCarInfo, InsuranceInfoEntity, LocationInfo, TripEntity } from "../../generated/schema"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";
import { getRentalityGateway, notImplemented } from "./helpers";

export function handleUserInsurance(event: RentalityEvent): void {
    let contract = getRentalityGateway();
    let insuranceInfo = contract.try_getGuestInsurance(event.params.from)
    
    if (insuranceInfo.reverted) {
        log.warning("getInsuranceInfo reverted for user: {}", [event.params.from.toString()]);
        return;
    } 
    let guestInsuranceInfo = GuestInsurancesEntity.load(event.params.from.toString());
    if( guestInsuranceInfo == null) {
        guestInsuranceInfo = new GuestInsurancesEntity(event.params.from.toString());
    }
    const insuranceIDs: string[] = [];
    for (let i = 0; i < insuranceInfo.value.length; i++) {
        const insurance = new InsuranceInfoEntity(insuranceInfo.value[i].policyNumber);
        insurance.companyName = insuranceInfo.value[i].companyName;
        insurance.comment = insuranceInfo.value[i].comment;
        insurance.createdBy = insuranceInfo.value[i].createdBy;
        insurance.createdTime = insuranceInfo.value[i].createdTime;
        insurance.insuranceType = insuranceInfo.value[i].insuranceType.toString();
        insurance.policyNumber = insuranceInfo.value[i].policyNumber;
        insurance.photo = insuranceInfo.value[i].photo;
        insurance.save();

    }
    guestInsuranceInfo.insurances = insuranceIDs
    
    guestInsuranceInfo.save();
}