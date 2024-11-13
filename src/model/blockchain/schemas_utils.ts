import { validateType } from "@/utils/typeValidator";
import {
  ClaimStatus,
  ClaimType,
  ContractAdminCarDTO,
  ContractAdminTripDTO,
  ContractAllCarsDTO,
  ContractAllTripsDTO,
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractChatInfo,
  ContractClaim,
  ContractFilterInfoDTO,
  ContractFullClaimInfo,
  ContractLocationInfo,
  ContractPublicHostCarDTO,
  ContractSearchCar,
  ContractSearchCarWithDistance,
  ContractTransactionInfo,
  ContractTrip,
  ContractTripDTO,
  EngineType,
  TripStatus,
} from "./schemas";

export const emptyContractLocationInfo: ContractLocationInfo = {
  userAddress: "",
  country: "",
  state: "",
  city: "",
  latitude: "",
  longitude: "",
  timeZoneId: "",
};

const emptyContractCarDetails: ContractCarDetails = {
  carId: BigInt(0),
  hostName: "",
  hostPhotoUrl: "",
  host: "",
  brand: "",
  model: "",
  yearOfProduction: BigInt(0),
  pricePerDayInUsdCents: BigInt(0),
  securityDepositPerTripInUsdCents: BigInt(0),
  milesIncludedPerDay: BigInt(0),
  engineType: EngineType.PETROL,
  engineParams: [],
  geoVerified: false,
  currentlyListed: false,
  locationInfo: emptyContractLocationInfo,
  carVinNumber: "",
};

export function validateContractCarDetails(obj: ContractCarDetails): obj is ContractCarDetails {
  return validateType(obj, emptyContractCarDetails) && validateType(obj.locationInfo, emptyContractLocationInfo);
}

const emptyContractCarInfo: ContractCarInfo = {
  carId: BigInt(0),
  carVinNumber: "",
  carVinNumberHash: "",
  createdBy: "",
  brand: "",
  model: "",
  yearOfProduction: BigInt(0),
  pricePerDayInUsdCents: BigInt(0),
  securityDepositPerTripInUsdCents: BigInt(0),
  engineType: EngineType.ELECTRIC,
  engineParams: [],
  milesIncludedPerDay: BigInt(0),
  currentlyListed: false,
  geoVerified: false,
  timeBufferBetweenTripsInSec: BigInt(0),
  timeZoneId: "",
  insuranceIncluded: false,
  locationHash: "",
};

export function validateContractCarInfo(obj: ContractCarInfo): obj is ContractCarInfo {
  return validateType(obj, emptyContractCarInfo);
}

export function validateContractCarInfoDTO(obj: ContractCarInfoDTO): obj is ContractCarInfoDTO {
  if (typeof obj !== "object" || obj == null) return false;
  const emptyContractCarInfoDTO: ContractCarInfoDTO = {
    carInfo: emptyContractCarInfo,
    metadataURI: "",
    isEditable: false,
  };

  return validateType(obj, emptyContractCarInfoDTO) && validateType(obj.carInfo, emptyContractCarInfo);
}

export function validateContractPublicHostCarDTO(obj: ContractPublicHostCarDTO): obj is ContractPublicHostCarDTO {
  if (typeof obj !== "object" || obj == null) return false;
  const emptyContractPublicHostCarDTO: ContractPublicHostCarDTO = {
    carId: BigInt(0),
    metadataURI: "",
    brand: "",
    model: "",
    yearOfProduction: BigInt(0),
    pricePerDayInUsdCents: BigInt(0),
    securityDepositPerTripInUsdCents: BigInt(0),
    milesIncludedPerDay: BigInt(0),
    currentlyListed: false,
  };

  return validateType(obj, emptyContractPublicHostCarDTO);
}

export function validateContractChatInfo(obj: ContractChatInfo): obj is ContractChatInfo {
  if (typeof obj !== "object" || obj == null) return false;
  const emptyContractChatInfo: ContractChatInfo = {
    tripId: BigInt(0),

    guestAddress: "",
    guestName: "",
    guestPhotoUrl: "",

    hostAddress: "",
    hostName: "",
    hostPhotoUrl: "",

    tripStatus: BigInt(0),
    startDateTime: BigInt(0),
    endDateTime: BigInt(0),
    timeZoneId: "",

    carBrand: "",
    carModel: "",
    carYearOfProduction: BigInt(0),
    carMetadataUrl: "",
  };

  return validateType(obj, emptyContractChatInfo);
}

const emptyContractClaim: ContractClaim = {
  tripId: BigInt(0),
  claimId: BigInt(0),
  deadlineDateInSec: BigInt(0),
  claimType: ClaimType.Tolls,
  status: ClaimStatus.NotPaid,
  description: "",
  amountInUsdCents: BigInt(0),
  payDateInSec: BigInt(0),
  rejectedBy: "",
  rejectedDateInSec: BigInt(0),
  isHostClaims: false,
  photosUrl: "",
};

export function validateContractClaim(obj: ContractClaim): obj is ContractClaim {
  return validateType(obj, emptyContractClaim);
}

export function validateContractFullClaimInfo(obj: ContractFullClaimInfo): obj is ContractFullClaimInfo {
  const emptyContractFullClaimInfo: ContractFullClaimInfo = {
    claim: emptyContractClaim,
    host: "",
    guest: "",
    hostPhoneNumber: "",
    guestPhoneNumber: "",
    carInfo: emptyContractCarInfo,
    amountInEth: BigInt(0),
    timeZoneId: "",
  };

  return validateType(obj, emptyContractFullClaimInfo) && validateType(obj.claim, emptyContractClaim);
}

const emptyContractSearchCar: ContractSearchCar = {
  carId: BigInt(0),
  brand: "",
  model: "",
  yearOfProduction: BigInt(0),
  pricePerDayInUsdCents: BigInt(0),
  securityDepositPerTripInUsdCents: BigInt(0),
  engineType: EngineType.PETROL,
  milesIncludedPerDay: BigInt(0),
  host: "",
  hostName: "",
  hostPhotoUrl: "",
  metadataURI: "",
  pricePerDayWithDiscount: BigInt(0),
  taxes: BigInt(0),
  totalPriceWithDiscount: BigInt(0),
  tripDays: BigInt(0),
  aboveTwentyFiveMilesInUsdCents: BigInt(0),
  underTwentyFiveMilesInUsdCents: BigInt(0),
  pickUp: BigInt(0),
  dropOf: BigInt(0),
  insuranceIncluded: false,
  locationInfo: emptyContractLocationInfo,
};

export function validateContractSearchCar(obj: ContractSearchCar): obj is ContractSearchCar {
  return validateType(obj, emptyContractSearchCar) && validateType(obj.locationInfo, emptyContractLocationInfo);
}

const emptyContractSearchCarWithDistance: ContractSearchCarWithDistance = {
  car: emptyContractSearchCar,
  distance: BigInt(0),
};

export function validateContractSearchCarWithDistance(
  obj: ContractSearchCarWithDistance
): obj is ContractSearchCarWithDistance {
  return validateType(obj, emptyContractSearchCarWithDistance) && validateType(obj.car, emptyContractSearchCar);
}

const emptyContractTransactionInfo: ContractTransactionInfo = {
  rentalityFee: BigInt(0),
  depositRefund: BigInt(0),
  tripEarnings: BigInt(0),
  dateTime: BigInt(0),
  statusBeforeCancellation: TripStatus.Pending,
};

export function validateContractTransactionInfo(obj: ContractTransactionInfo): obj is ContractTransactionInfo {
  return validateType(obj, emptyContractTransactionInfo);
}

const emptyContractTrip: ContractTrip = {
  tripId: BigInt(0),
  carId: BigInt(0),
  status: TripStatus.Pending,
  guest: "",
  host: "",
  pricePerDayInUsdCents: BigInt(0),
  startDateTime: BigInt(0),
  endDateTime: BigInt(0),
  milesIncludedPerDay: BigInt(0),
  paymentInfo: {
    tripId: BigInt(0),
    from: "",
    to: "",
    totalDayPriceInUsdCents: BigInt(0),
    governmentTax: BigInt(0),
    salesTax: BigInt(0),
    depositInUsdCents: BigInt(0),
    resolveAmountInUsdCents: BigInt(0),
    currencyType: "",
    currencyRate: BigInt(0),
    currencyDecimals: BigInt(0),
    resolveFuelAmountInUsdCents: BigInt(0),
    resolveMilesAmountInUsdCents: BigInt(0),
    priceWithDiscount: BigInt(0),
    pickUpFee: BigInt(0),
    dropOfFee: BigInt(0),
  },
  approvedDateTime: BigInt(0),
  rejectedDateTime: BigInt(0),
  rejectedBy: "",
  checkedInByHostDateTime: BigInt(0),
  startParamLevels: [],
  checkedInByGuestDateTime: BigInt(0),
  checkedOutByGuestDateTime: BigInt(0),
  endParamLevels: [],
  checkedOutByHostDateTime: BigInt(0),
  guestName: "",
  hostName: "",
  createdDateTime: BigInt(0),
  tripFinishedBy: "",
  tripStartedBy: "",
  transactionInfo: emptyContractTransactionInfo,
  engineType: EngineType.PETROL,
  fuelPrice: BigInt(0),
  guestInsuranceCompanyName: "",
  guestInsurancePolicyNumber: "",
  finishDateTime: BigInt(0),
  pickUpHash: "",
  returnHash: "",
};

export function validateContractTrip(obj: ContractTrip): obj is ContractTrip {
  return validateType(obj, emptyContractTrip);
}

const emptyContractTripDTO: ContractTripDTO = {
  trip: emptyContractTrip,
  guestPhotoUrl: "",
  hostPhotoUrl: "",
  metadataURI: "",
  timeZoneId: "",
  guestDrivingLicenseExpirationDate: BigInt(0),
  guestDrivingLicenseNumber: "",
  hostDrivingLicenseExpirationDate: BigInt(0),
  hostDrivingLicenseNumber: "",
  brand: "",
  model: "",
  yearOfProduction: BigInt(0),
  pickUpLocation: emptyContractLocationInfo,
  returnLocation: emptyContractLocationInfo,
  guestPhoneNumber: "",
  hostPhoneNumber: "",
};

export function validateContractTripDTO(obj: ContractTripDTO): obj is ContractTripDTO {
  return (
    validateType(obj, emptyContractTripDTO) &&
    validateType(obj.trip, emptyContractTrip) &&
    validateType(obj.pickUpLocation, emptyContractLocationInfo) &&
    validateType(obj.returnLocation, emptyContractLocationInfo)
  );
}

const emptyContractAllTripsDTO: ContractAllTripsDTO = {
  trips: [],
  totalPageCount: BigInt(0),
};

const emptyContractAdminTripDTO: ContractAdminTripDTO = {
  trip: emptyContractTrip,
  carLocation: emptyContractLocationInfo,
  carMetadataURI: "",
};

export function validateContractAllTripsDTO(obj: ContractAllTripsDTO): obj is ContractAllTripsDTO {
  return (
    validateType(obj, emptyContractAllTripsDTO) &&
    (obj.trips.length === 0 ||
      (validateType(obj.trips[0], emptyContractAdminTripDTO) &&
        validateType(obj.trips[0].trip, emptyContractTrip) &&
        validateType(obj.trips[0].carLocation, emptyContractLocationInfo)))
  );
}

const emptyContractAllCarsDTO: ContractAllCarsDTO = {
  cars: [],
  totalPageCount: BigInt(0),
};

const emptyContractAdminCarDTO: ContractAdminCarDTO = {
  car: emptyContractCarDetails,
  carMetadataURI: "",
};

export function validateContractAllCarsDTO(obj: ContractAllCarsDTO): obj is ContractAllCarsDTO {
  return (
    validateType(obj, emptyContractAllCarsDTO) &&
    (obj.cars.length === 0 ||
      (validateType(obj.cars[0], emptyContractAdminCarDTO) && validateType(obj.cars[0].car, emptyContractCarDetails)))
  );
}

const emptyContractFilterInfoDTO: ContractFilterInfoDTO = {
  maxCarPrice: BigInt(0),
  minCarYearOfProduction: BigInt(0),
};

export function validateContractFilterInfoDTO(obj: ContractFilterInfoDTO): obj is ContractFilterInfoDTO {
  return validateType(obj, emptyContractFilterInfoDTO);
}
