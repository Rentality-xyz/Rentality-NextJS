import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import {RentalityEvent,RentalityGateway} from "../../generated/RentalityNotificationService/RentalityGateway";
import { CarInfo, CarTrip, LocationInfo, PaymentInfoEntity, TripEntity } from "../../generated/schema"
import { getRentalityGateway, getRentalityTripsService, notImplemented } from "./helpers"


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
     let contract = getRentalityTripsService();
  
    let tripDTOResult = contract.try_getTrip(event.params.id)
    if (tripDTOResult.reverted) {
        log.warning("getTrip reverted for tripId: {}", [event.params.id.toString()]);
        return;
      } 

      if(newTrip) {
        const carIdStr = tripDTOResult.value.carId.toString();
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
    entity.tripId = tripDTO.tripId
    entity.carId = tripDTO.carId
    entity.status = tripDTO.status
    entity.guest = tripDTO.guest.toHexString()
    entity.host = tripDTO.host.toHexString()
    entity.guestName = tripDTO.guestName
    entity.hostName = tripDTO.hostName
    entity.pricePerDayInUsdCents = tripDTO.pricePerDayInUsdCents
    entity.startDateTime = tripDTO.startDateTime
    entity.endDateTime = tripDTO.endDateTime
    entity.engineType = tripDTO.engineType
    entity.milesIncludedPerDay = tripDTO.milesIncludedPerDay
    entity.fuelPrice = tripDTO.fuelPrice
    entity.createdDateTime = tripDTO.createdDateTime
    entity.approvedDateTime = tripDTO.approvedDateTime
    entity.rejectedDateTime = tripDTO.rejectedDateTime
    entity.guestInsuranceCompanyName = tripDTO.guestInsuranceCompanyName
    entity.guestInsurancePolicyNumber = tripDTO.guestInsurancePolicyNumber
    entity.rejectedBy = tripDTO.rejectedBy.toHexString()
    entity.checkedInByHostDateTime = tripDTO.checkedInByHostDateTime
    entity.checkedInByGuestDateTime = tripDTO.checkedInByGuestDateTime
    entity.tripStartedBy = tripDTO.tripStartedBy.toHexString()
    entity.checkedOutByGuestDateTime = tripDTO.checkedOutByGuestDateTime
    entity.checkedOutByHostDateTime = tripDTO.checkedOutByHostDateTime
    entity.finishDateTime = tripDTO.finishDateTime
    entity.pickUpHash = tripDTO.pickUpHash
    entity.returnHash = tripDTO.returnHash
    entity.tripFinishedBy = tripDTO.tripFinishedBy.toHexString()
    entity.tripFinishedByHost = tripDTO.tripFinishedBy.toHexString() == tripDTO.host.toHexString()
  
  
    let paymentEntity = new PaymentInfoEntity(tripIdStr)
    paymentEntity.tripId = tripDTO.paymentInfo.tripId
    paymentEntity.from = tripDTO.paymentInfo.from.toHexString()
    paymentEntity.to = tripDTO.paymentInfo.to.toHexString()
    paymentEntity.totalDayPriceInUsdCents = tripDTO.paymentInfo.totalDayPriceInUsdCents
    paymentEntity.salesTax = tripDTO.paymentInfo.salesTax
    paymentEntity.governmentTax = tripDTO.paymentInfo.governmentTax
    paymentEntity.priceWithDiscount = tripDTO.paymentInfo.priceWithDiscount
    paymentEntity.depositInUsdCents = tripDTO.paymentInfo.depositInUsdCents
    paymentEntity.resolveAmountInUsdCents = tripDTO.paymentInfo.resolveAmountInUsdCents
    paymentEntity.currencyType = tripDTO.paymentInfo.currencyType.toHexString()
    paymentEntity.currencyRate = tripDTO.paymentInfo.currencyRate
    paymentEntity.currencyDecimals = tripDTO.paymentInfo.currencyDecimals
    paymentEntity.resolveFuelAmountInUsdCents = tripDTO.paymentInfo.resolveFuelAmountInUsdCents
    paymentEntity.resolveMilesAmountInUsdCents = tripDTO.paymentInfo.resolveMilesAmountInUsdCents
    paymentEntity.pickUpFee = tripDTO.paymentInfo.pickUpFee
    paymentEntity.dropOfFee = tripDTO.paymentInfo.dropOfFee
    paymentEntity.save()
  
    entity.paymentInfo = paymentEntity.id
  
    entity.save()
  }
  