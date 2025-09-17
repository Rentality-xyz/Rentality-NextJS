import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { CarInfo, CarTrip, CarUser, InsuranceCarInfo, LocationInfo, TaxesEntity, TripEntity, UserCurrencyDTOEntity, UserProfileEntity } from "../../generated/schema"
import {RentalityEvent, RentalityGateway__getCarDetailsResultCarDetailsLocationInfoStruct} from "../../generated/RentalityNotificationService/RentalityGateway";
import { getRentalityGateway, notImplemented, TaxesLocationType } from "./helpers";
import { DEFAULT_CURRENCY } from "./userCurrencyHandler";



export function handleCarEvents(event: RentalityEvent): void {
  switch (event.params.objectStatus) {
    case 0:  handleCarCreationEvent(event);
    break;
    case 1: handleUpdateCarEvent(event);
    break;
    default: notImplemented(event);
    break;

}
}

function handleUpdateCarEvent(event: RentalityEvent): void {

  let entity = CarInfo.load(event.params.id.toString());
  if (entity == null) {
    log.warning("CarInfo entity not found for carId: {}", [event.params.id.toString()]);
    return;
  }

  let contract = getRentalityGateway();
  let carInfoResult = contract.try_getCarInfoById(event.params.id);
  if (carInfoResult.reverted) {
    log.warning("getCarInfoById reverted for carId: {}", [event.params.id.toString()]);
    return;
  }

  let carInfo = carInfoResult.value;

  entity.pricePerDayInUsdCents = carInfo.carInfo.pricePerDayInUsdCents;
  entity.securityDepositPerTripInUsdCents = carInfo.carInfo.securityDepositPerTripInUsdCents;
  entity.milesIncludedPerDay = carInfo.carInfo.milesIncludedPerDay;
  entity.engineParams = carInfo.carInfo.engineParams;
  entity.engineType = carInfo.carInfo.engineType;
  entity.timeBufferBetweenTripsInSec = carInfo.carInfo.timeBufferBetweenTripsInSec;

  entity.locationHash = carInfo.carInfo.locationHash;
  entity.timeZoneId = carInfo.carInfo.timeZoneId;
  entity.currentlyListed = carInfo.carInfo.currentlyListed;;

  const carIdStr = event.params.id.toString();
  if (entity.user._id == DEFAULT_CURRENCY) {
    if(UserProfileEntity.load(carInfo.carInfo.createdBy.toHexString()) != null) {
      let carUser = CarUser.load(DEFAULT_CURRENCY);
    
      if(carUser != null) {
      let allCars:string[] = []
      for (let i = 0; i < carUser.cars.length; i++) {
        if(carUser.cars[i] != carIdStr){
          allCars.push(carUser.cars[i])
        }
      }
       carUser.cars = allCars;
       carUser.save();
      }
    }
    let hostCars = CarUser.load(carInfo.carInfo.createdBy.toHexString());
    if (hostCars == null) {
      hostCars = new CarUser(carInfo.carInfo.createdBy.toHexString());
      hostCars.user = carInfo.carInfo.createdBy.toHexString();
      hostCars.cars = [];
    }
    const hCars = hostCars.cars;
    hCars.push(event.params.id.toString()); 
    hostCars.cars = hCars; 

    hostCars.save();

  }

  const locationId = carInfo.carInfo.locationHash.toHexString();
  let location = LocationInfo.load(locationId);

  if (location == null) {
    const newLocation = new LocationInfo(locationId);
    const carDetailsResult = contract.try_getCarDetails(event.params.id)
  if(carDetailsResult == null) {
    log.error("Car craetion error: can not get carDetails",[]);
    return
    }
    const carDetails = carDetailsResult.value

    newLocation.latitude = carDetails.locationInfo.latitude;
    newLocation.longitude = carDetails.locationInfo.longitude;
    newLocation.city = carDetails.locationInfo.city;
    newLocation.country = carDetails.locationInfo.country;
    newLocation.state = carDetails.locationInfo.state;
    newLocation.timeZoneId = carDetails.locationInfo.timeZoneId;
    newLocation.userAddress = carDetails.locationInfo.userAddress;
    newLocation.save();
  }
  if(entity.createdBy.toHexString() == DEFAULT_CURRENCY) {
    if(UserProfileEntity.load(carInfo.carInfo.createdBy.toHexString()) != null) {
      entity.host = carInfo.carInfo.createdBy.toHexString();
    }
    }

  const carInsuranceEntity = InsuranceCarInfo.load(
    event.params.id.toString()
  )
  if (carInsuranceEntity != null) {

  carInsuranceEntity.priceInUsdCents = carInfo.insuranceInfo.priceInUsdCents
  carInsuranceEntity.required = carInfo.insuranceInfo.required
  carInsuranceEntity.save();
  }

  entity.save();
}

function handleCarCreationEvent(event: RentalityEvent): void {
  const carIdStr = event.params.id.toString();
  let entity = new CarInfo(
    carIdStr
  )
  let contract = getRentalityGateway();
  let carInfoResult = contract.try_getCarInfoById(event.params.id);
  if (carInfoResult.reverted) {
    log.warning("getCarInfoById reverted for carId: {}", [carIdStr]);
    return;
  } 
  let carInfo = carInfoResult.value;

    let userStr = carInfo.carInfo.createdBy.toHexString();
    let isEmptyUser = UserProfileEntity.load(carInfo.carInfo.createdBy.toHexString()) == null;

      if (isEmptyUser) {
        userStr = DEFAULT_CURRENCY;
      }
    let carUser = CarUser.load(userStr);
    if (!carUser) {
        carUser = new CarUser(carIdStr);
        carUser.user = userStr;
        carUser.cars = [];
    }
    const cars = carUser.cars;
    cars.push(carIdStr); 
    carUser.cars = cars; 
  
    carUser.save();
    
 
  entity.brand = carInfo.carInfo.brand
  entity.model = carInfo.carInfo.model
  entity.yearOfProduction = carInfo.carInfo.yearOfProduction
  entity.carVinNumber = carInfo.carInfo.carVinNumber
  entity.carVinNumberHash = carInfo.carInfo.carVinNumberHash
  entity.createdBy = carInfo.carInfo.createdBy
  entity.currentlyListed = carInfo.carInfo.currentlyListed
  entity.carId = event.params.id
  entity.engineType = carInfo.carInfo.engineType
  entity.engineParams = carInfo.carInfo.engineParams
  entity.milesIncludedPerDay = carInfo.carInfo.milesIncludedPerDay
  entity.locationHash = carInfo.carInfo.locationHash
  entity.timeBufferBetweenTripsInSec = carInfo.carInfo.timeBufferBetweenTripsInSec
  entity.tokenURI = carInfo.carMetadataURI
  entity.pricePerDayInUsdCents = carInfo.carInfo.pricePerDayInUsdCents
  entity.securityDepositPerTripInUsdCents = carInfo.carInfo.securityDepositPerTripInUsdCents
  entity.geoVerified = true;
  entity.timeZoneId = carInfo.carInfo.timeZoneId
  entity.insuranceIncluded = carInfo.carInfo.insuranceIncluded
  entity.burned = false;
  entity.host = carInfo.carInfo.createdBy.toHexString()

 

  const carDetailsResult = contract.try_getCarDetails(event.params.id)
  if(carDetailsResult == null) {
    log.error("Car craetion error: can not get carDetails",[]);
    return
    }
    const carDetails = carDetailsResult.value


  let taxesToSave = getTaxId(carDetails.locationInfo);

  if (taxesToSave == null) {
    log.warning("No tax rules found for carId: {}", [event.params.id.toString()]);
    return;
  }
  entity.taxes = taxesToSave;
  entity.locationInfo = carInfo.carInfo.locationHash.toHexString()
  
  const location = LocationInfo.load(carInfo.carInfo.locationHash.toHexString())

  if(location == null) {
    const newLocation = new LocationInfo(carInfo.carInfo.locationHash.toHexString())
 
    newLocation.latitude = carDetails.locationInfo.latitude
    newLocation.longitude = carDetails.locationInfo.longitude
    newLocation.city = carDetails.locationInfo.city
    newLocation.country = carDetails.locationInfo.country
    newLocation.state = carDetails.locationInfo.state
    newLocation.timeZoneId = carDetails.locationInfo.timeZoneId
    newLocation.userAddress = carDetails.locationInfo.userAddress

    newLocation.save()
  }


  const carInsuranceEntity = new InsuranceCarInfo(
    event.params.id.toString()
  )
  carInsuranceEntity.priceInUsdCents = carInfo.insuranceInfo.priceInUsdCents
  carInsuranceEntity.required = carInfo.insuranceInfo.required
  carInsuranceEntity.save();

  entity.insuranceCarInfo = carInsuranceEntity.id;
  entity.locationInfo = carInfo.carInfo.locationHash.toHexString()
  entity.dimoTokenId = carDetails.dimoTokenId;
  entity.save()


}

const getTaxId = (location: RentalityGateway__getCarDetailsResultCarDetailsLocationInfoStruct): string | null => {
        let taxes = TaxesEntity.load(location.country + TaxesLocationType.Country.toString())
        taxes = taxes || TaxesEntity.load(location.state + TaxesLocationType.State.toString());
        taxes = taxes || TaxesEntity.load(location.city + TaxesLocationType.City.toString());
        return taxes ? taxes.id : null;
  };
  function isMatchingCar(a: string, b: string): bool {
    return a == b;
  }
