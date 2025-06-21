import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import {RentalityEvent} from "../../generated/RentalityNotificationService/RentalityNotificationService";
import { CarInfo, CarTrip, InsuranceInfo, LocationInfo, PaymentInfoEntity, TaxesEntity, TaxValueEntity, TransactionInfoEntity, TripEntity } from "../../generated/schema"
import { getRentalityGateway, getRentalityTripsService, getGeoService } from "./helpers"


export function handleTripEvents(event: RentalityEvent): void {
  switch (event.params.objectStatus) {
    default: handleTripCreationEvent(event);
    break;

}
}
export function handleTripCreationEvent(event: RentalityEvent): void {
    let tripIdStr = event.params.id.toString()
  
    let entity = TripEntity.load(tripIdStr);
    let newTrip = false;
    if (entity == null) {
        entity = new TripEntity(tripIdStr)
        newTrip = true;
    }
     let contract = getRentalityGateway();
  
    let tripDTOResult = contract.try_getTrip(event.params.id)
    if (tripDTOResult.reverted) {
        log.warning("getTrip reverted for tripId: {}", [event.params.id.toString()]);
        return;
      } 

      if(newTrip) {
        const carIdStr = tripDTOResult.value.trip.carId.toString();
        let carTrip = CarTrip.load(carIdStr);
        if (!carTrip) {
          carTrip = new CarTrip(carIdStr);
          carTrip.car = carIdStr
          carTrip.trips = [];
        }
        const trips = carTrip.trips;
        trips.push(tripIdStr); 
        carTrip.trips = trips; 
      
        carTrip.save();
    }
      
   let tripDTO = tripDTOResult.value;
    entity.tripId = tripDTO.trip.tripId
    entity.carId = tripDTO.trip.carId
    entity.status = tripDTO.trip.status
    entity.guest = tripDTO.trip.guest.toHexString()
    entity.host = tripDTO.trip.host.toHexString()
    entity.pricePerDayInUsdCents = tripDTO.trip.pricePerDayInUsdCents
    entity.startDateTime = tripDTO.trip.startDateTime
    entity.endDateTime = tripDTO.trip.endDateTime
    entity.engineType = tripDTO.trip.engineType
    entity.milesIncludedPerDay = tripDTO.trip.milesIncludedPerDay
    entity.fuelPrice = tripDTO.trip.fuelPrice
    entity.createdDateTime = tripDTO.trip.createdDateTime
    entity.approvedDateTime = tripDTO.trip.approvedDateTime
    entity.rejectedDateTime = tripDTO.trip.rejectedDateTime
    entity.guestInsuranceCompanyName = tripDTO.trip.guestInsuranceCompanyName
    entity.guestInsurancePolicyNumber = tripDTO.trip.guestInsurancePolicyNumber
    entity.rejectedBy = tripDTO.trip.rejectedBy.toHexString()
    entity.checkedInByHostDateTime = tripDTO.trip.checkedInByHostDateTime
    entity.checkedInByGuestDateTime = tripDTO.trip.checkedInByGuestDateTime
    entity.tripStartedBy = tripDTO.trip.tripStartedBy.toHexString()
    entity.checkedOutByGuestDateTime = tripDTO.trip.checkedOutByGuestDateTime
    entity.checkedOutByHostDateTime = tripDTO.trip.checkedOutByHostDateTime
    entity.finishDateTime = tripDTO.trip.finishDateTime
    entity.pickUpHash = tripDTO.trip.pickUpHash
    entity.returnHash = tripDTO.trip.returnHash
    entity.tripFinishedBy = tripDTO.trip.tripFinishedBy.toHexString()
    entity.tripFinishedByHost = tripDTO.trip.tripFinishedBy.toHexString() == tripDTO.trip.host.toHexString()
    entity.startParamLevels = tripDTO.trip.startParamLevels;
    entity.endParamLevels = tripDTO.trip.endParamLevels;
  
  
    let paymentEntity = new PaymentInfoEntity(tripIdStr)
    paymentEntity.tripId = tripDTO.trip.paymentInfo.tripId
    paymentEntity.from = tripDTO.trip.paymentInfo.from.toHexString()
    paymentEntity.to = tripDTO.trip.paymentInfo.to.toHexString()
    paymentEntity.totalDayPriceInUsdCents = tripDTO.trip.paymentInfo.totalDayPriceInUsdCents
    paymentEntity.salesTax = tripDTO.trip.paymentInfo.salesTax
    paymentEntity.governmentTax = tripDTO.trip.paymentInfo.governmentTax
    paymentEntity.priceWithDiscount = tripDTO.trip.paymentInfo.priceWithDiscount
    paymentEntity.depositInUsdCents = tripDTO.trip.paymentInfo.depositInUsdCents
    paymentEntity.resolveAmountInUsdCents = tripDTO.trip.paymentInfo.resolveAmountInUsdCents
    paymentEntity.currencyType = tripDTO.trip.paymentInfo.currencyType.toHexString()
    paymentEntity.currencyRate = tripDTO.trip.paymentInfo.currencyRate
    paymentEntity.currencyDecimals = tripDTO.trip.paymentInfo.currencyDecimals
    paymentEntity.resolveFuelAmountInUsdCents = tripDTO.trip.paymentInfo.resolveFuelAmountInUsdCents
    paymentEntity.resolveMilesAmountInUsdCents = tripDTO.trip.paymentInfo.resolveMilesAmountInUsdCents
    paymentEntity.pickUpFee = tripDTO.trip.paymentInfo.pickUpFee
    paymentEntity.dropOfFee = tripDTO.trip.paymentInfo.dropOfFee
    paymentEntity.save()

    entity.paymentInfo = paymentEntity.id


    let transactionInfo = new TransactionInfoEntity(tripIdStr);
 transactionInfo.dateTime = tripDTO.trip.transactionInfo.dateTime
 transactionInfo.depositRefund = tripDTO.trip.transactionInfo.depositRefund
 transactionInfo.rentalityFee = tripDTO.trip.transactionInfo.rentalityFee
 transactionInfo.statusBeforeCancellation = tripDTO.trip.transactionInfo.statusBeforeCancellation
 transactionInfo.tripEarnings = tripDTO.trip.transactionInfo.tripEarnings
 transactionInfo.save()
    entity.transactionInfo = transactionInfo.id

    if (newTrip) {
    
      let pickUpLocation = LocationInfo.load( tripDTO.trip.pickUpHash.toHexString());
      if (pickUpLocation == null) {
        pickUpLocation = new LocationInfo( tripDTO.trip.pickUpHash.toHexString());
        let geoService = getGeoService();
        let locationResult = geoService.try_getLocationInfo( tripDTO.trip.pickUpHash);
        if (locationResult.reverted) {
          log.warning("getLocationInfo reverted for pickUpHash: {}", [ tripDTO.trip.pickUpHash.toHexString()]);
          return;
        }
        pickUpLocation.latitude = locationResult.value.latitude
        pickUpLocation.longitude = locationResult.value.longitude;
        pickUpLocation.city = locationResult.value.city;
        pickUpLocation.state = locationResult.value.state;
        pickUpLocation.country = locationResult.value.country;
        pickUpLocation.timeZoneId = locationResult.value.timeZoneId;
        pickUpLocation.userAddress = locationResult.value.userAddress;
        pickUpLocation.save();
}

  let dropOfLocation = LocationInfo.load( tripDTO.trip.returnHash.toHexString());
    if (dropOfLocation == null) {
      dropOfLocation = new LocationInfo( tripDTO.trip.returnHash.toHexString());
      let geoService = getGeoService();
      let locationResult = geoService.try_getLocationInfo( tripDTO.trip.returnHash);
      if (locationResult.reverted) {
        log.warning("getLocationInfo reverted for pickUpHash: {}", [ tripDTO.trip.pickUpHash.toHexString()]);
        return;
      }
      dropOfLocation.latitude = locationResult.value.latitude
      dropOfLocation.longitude = locationResult.value.longitude;
      dropOfLocation.city = locationResult.value.city;
      dropOfLocation.state = locationResult.value.state;
      dropOfLocation.country = locationResult.value.country;
      dropOfLocation.timeZoneId = locationResult.value.timeZoneId;
      dropOfLocation.userAddress = locationResult.value.userAddress;
      dropOfLocation.save();
    }
    entity.pickUpLocation = pickUpLocation.id;
    entity.dropOfLocation = dropOfLocation.id;

    let taxes: string[] = [];
    for (let i = 0; i < tripDTO.taxesData.length; i++) {
      let taxesId = tripDTO.taxesData[i].name.toString() + tripDTO.trip.tripId.toString()
  taxes.push(taxesId);
      let tax = new TaxValueEntity(taxesId);
  tax.name = tripDTO.taxesData[i].name;
  tax.value = tripDTO.taxesData[i].value;
  tax.tType = tripDTO.taxesData[i].tType.toString();
  tax.save()
    }
    entity.taxesData = taxes;

    let insurances: string[] = [];
    for (let i = 0; i < tripDTO.insurancesInfo.length; i++) {
      let insuranceId = tripDTO.insurancesInfo[i].createdTime.toString() + tripDTO.insurancesInfo[i].companyName;
      insurances.push(insuranceId);
      let tripInsurance = new InsuranceInfo(insuranceId);
  tripInsurance.comment = tripDTO.insurancesInfo[i].comment;
  tripInsurance.companyName = tripDTO.insurancesInfo[i].companyName;
  tripInsurance.policyNumber = tripDTO.insurancesInfo[i].policyNumber;
  tripInsurance.createdTime = tripDTO.insurancesInfo[i].createdTime;
  tripInsurance.createdBy = tripDTO.insurancesInfo[i].createdBy.toHexString();
  tripInsurance.insuranceType = tripDTO.insurancesInfo[i].insuranceType;
  tripInsurance.photo = tripDTO.insurancesInfo[i].photo;
  tripInsurance.save();
  }
    entity.paidForInsuranceInUsdCents = tripDTO.paidForInsuranceInUsdCents;
    entity.guestDrivingLicenseIssueCountry = tripDTO.guestDrivingLicenseIssueCountry;
    entity.promoDiscount = tripDTO.promoDiscount;
    entity.insuranceInfo = insurances;
  
  
  }
  entity.save()
}
  