import { Address, bigInt, ethereum, log } from "@graphprotocol/graph-ts"
import { CarInfo, CarTrip, CarUser, InsuranceCarInfo, LocationInfo, TaxesEntity, TripEntity, UserCurrencyDTOEntity, UserProfileEntity } from "../../generated/schema"
import { CarGatewayRead__getCarDetailsResultValue0LocationInfoStruct } from "../../generated/RentalityNotificationService/CarGatewayRead";
import { RentalityEvent } from "../../generated/RentalityNotificationService/RentalityNotificationService";
import { getCarGatewayRead, notImplemented, TaxesLocationType } from "./helpers";
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

  let contract = getCarGatewayRead();
  let carInfoResult = contract.try_getCarInfoById(event.params.id);
  if (carInfoResult.reverted) {
    log.warning("getCarInfoById reverted for carId: {}", [event.params.id.toString()]);
    return;
  }

  let carInfo = carInfoResult.value;

  entity.pricePerDayInUsdCents = carInfo.carInfo.car.pricePerDayInUsdCents;
  entity.securityDepositPerTripInUsdCents = carInfo.carInfo.car.securityDepositPerTripInUsdCents;
  entity.milesIncludedPerDay = carInfo.carInfo.car.milesIncludedPerDay;
  entity.engineParams = carInfo.carInfo.car.engineParams;
  entity.engineType = carInfo.carInfo.car.engineType;
  entity.timeBufferBetweenTripsInSec = carInfo.carInfo.car.timeBufferBetweenTripsInSec;

  entity.locationHash = carInfo.carInfo.car.locationHash;
  entity.timeZoneId = carInfo.carInfo.car.timeZoneId;
  entity.currentlyListed = carInfo.carInfo.car.currentlyListed;

  const carIdStr = event.params.id.toString();
  if (entity.host == DEFAULT_CURRENCY) {
    if(UserProfileEntity.load(carInfo.carInfo.asset.owner.toHexString()) != null) {
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
    let hostCars = CarUser.load(carInfo.carInfo.asset.owner.toHexString());
    if (hostCars == null) {
      hostCars = new CarUser(carInfo.carInfo.asset.owner.toHexString());
      hostCars.user = carInfo.carInfo.asset.owner.toHexString();
      hostCars.cars = [];
    }
    const hCars = hostCars.cars;
    hCars.push(event.params.id.toString()); 
    hostCars.cars = hCars; 

    hostCars.save();

  }

  const locationId = carInfo.carInfo.car.locationHash.toHexString();
  const carDetailsResult = contract.try_getCarDetails(event.params.id)
  if(carDetailsResult.reverted) {
    log.error("Car creation error: can not get carDetails for carId: {}", [event.params.id.toString()]);
    return;
    }
    const carDetails = carDetailsResult.value
  upsertLocationInfo(locationId, carDetails.locationInfo);
  if(entity.host == DEFAULT_CURRENCY) {
    if(UserProfileEntity.load(carInfo.carInfo.asset.owner.toHexString()) != null) {
      entity.host = carInfo.carInfo.asset.owner.toHexString();
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
  let contract = getCarGatewayRead();
  let carInfoResult = contract.try_getCarInfoById(event.params.id);
  if (carInfoResult.reverted) {
    log.warning("getCarInfoById reverted for carId: {}", [carIdStr]);
    return;
  } 
  let carInfo = carInfoResult.value;

    let userStr = carInfo.carInfo.asset.owner.toHexString();
    let isEmptyUser = UserProfileEntity.load(carInfo.carInfo.asset.owner.toHexString()) == null;

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
    
 
  entity.brand = carInfo.carInfo.car.brand
  entity.model = carInfo.carInfo.car.model
  entity.yearOfProduction = carInfo.carInfo.car.yearOfProduction
  entity.carVinNumber = carInfo.carInfo.car.carVinNumber
  entity.carVinNumberHash = carInfo.carInfo.car.carVinNumberHash
  entity.createdBy = carInfo.carInfo.asset.owner
  entity.currentlyListed = carInfo.carInfo.car.currentlyListed
  entity.carId = event.params.id
  entity.engineType = carInfo.carInfo.car.engineType
  entity.engineParams = carInfo.carInfo.car.engineParams
  entity.milesIncludedPerDay = carInfo.carInfo.car.milesIncludedPerDay
  entity.locationHash = carInfo.carInfo.car.locationHash
  entity.timeBufferBetweenTripsInSec = carInfo.carInfo.car.timeBufferBetweenTripsInSec
  entity.tokenURI = carInfo.carMetadataURI
  entity.pricePerDayInUsdCents = carInfo.carInfo.car.pricePerDayInUsdCents
  entity.securityDepositPerTripInUsdCents = carInfo.carInfo.car.securityDepositPerTripInUsdCents
  entity.geoVerified = carInfo.carInfo.car.geoVerified;
  entity.timeZoneId = carInfo.carInfo.car.timeZoneId
  entity.insuranceIncluded = carInfo.carInfo.car.insuranceIncluded
  entity.burned = false;
  entity.host = carInfo.carInfo.asset.owner.toHexString()

 

  const carDetailsResult = contract.try_getCarDetails(event.params.id)
  if(carDetailsResult.reverted) {
    log.error("Car creation error: can not get carDetails for carId: {}", [event.params.id.toString()]);
    return;
    }
    const carDetails = carDetailsResult.value


  let taxesToSave = getTaxId(carDetails.locationInfo);

  if (taxesToSave == null) {
    log.warning("No tax rules found for carId: {}", [event.params.id.toString()]);
  } else {
    entity.taxes = taxesToSave;
  }
  entity.locationInfo = carInfo.carInfo.car.locationHash.toHexString()
  
  upsertLocationInfo(carInfo.carInfo.car.locationHash.toHexString(), carDetails.locationInfo);


  const carInsuranceEntity = new InsuranceCarInfo(
    event.params.id.toString()
  )
  carInsuranceEntity.priceInUsdCents = carInfo.insuranceInfo.priceInUsdCents
  carInsuranceEntity.required = carInfo.insuranceInfo.required
  carInsuranceEntity.save();

  entity.insuranceCarInfo = carInsuranceEntity.id;
  entity.locationInfo = carInfo.carInfo.car.locationHash.toHexString()
  entity.dimoTokenId = carDetails.dimoTokenId;
  entity.save()


}

const getTaxId = (location: CarGatewayRead__getCarDetailsResultValue0LocationInfoStruct): string | null => {
        let taxes = TaxesEntity.load(location.country + TaxesLocationType.Country.toString())
        taxes = taxes || TaxesEntity.load(location.state + TaxesLocationType.State.toString());
        taxes = taxes || TaxesEntity.load(location.city + TaxesLocationType.City.toString());
        return taxes ? taxes.id : null;
  };
  function upsertLocationInfo(
    locationId: string,
    locationInfo: CarGatewayRead__getCarDetailsResultValue0LocationInfoStruct
  ): void {
    let location = LocationInfo.load(locationId);
    if (location == null) {
      location = new LocationInfo(locationId);
    }

    location.latitude = locationInfo.latitude;
    location.longitude = locationInfo.longitude;
    location.city = locationInfo.city;
    location.country = locationInfo.country;
    location.state = locationInfo.state;
    location.timeZoneId = locationInfo.timeZoneId;
    location.userAddress = locationInfo.userAddress;
    location.save();
  }
  function isMatchingCar(a: string, b: string): bool {
    return a == b;
  }
