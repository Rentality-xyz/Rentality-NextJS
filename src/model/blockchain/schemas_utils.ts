import { validateType } from "@/features/blockchain/utils.ts";
import {
  ClaimStatus,
  ClaimType,
  ContractAdditionalKYCInfo,
  ContractAdminCarDTO,
  ContractAdminKYCInfoDTO,
  ContractAdminTripDTO,
  ContractAllCarsDTO,
  ContractAllTripsDTO,
  ContractAvailableCarDTO,
  ContractBaseDiscount,
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractChatInfo,
  ContractCheckPromoDTO,
  ContractClaim,
  ContractClaimTypeV2,
  ContractFilterInfoDTO,
  ContractFullClaimInfo,
  ContractFullKYCInfoDTO,
  ContractInsuranceCarInfo,
  ContractInsuranceDTO,
  ContractInsuranceInfo,
  ContractKYCInfo,
  ContractLocationInfo,
  ContractPromoDTO,
  ContractPublicHostCarDTO,
  ContractSearchCar,
  ContractSearchCarWithDistance,
  ContractTransactionInfo,
  ContractTrip,
  ContractTripDTO,
  EngineType,
  InsuranceType,
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
  carMetadataURI: "",
  dimoTokenId: BigInt(0),
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
  locationHash: "",
  insuranceIncluded: true,
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
    dimoTokenId: BigInt(0),
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

const emptyClaimType: ContractClaimTypeV2 = {
  claimType: BigInt(0),
  claimName: "",
  creator: BigInt(0),
};
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
    claimType: emptyClaimType,
  };

  return (
    validateType(obj, emptyContractFullClaimInfo) &&
    validateType(obj.claim, emptyContractClaim) &&
    validateType(obj.claimType, emptyClaimType)
  );
}

const emptyContractInsuranceCarInfo: ContractInsuranceCarInfo = {
  required: false,
  priceInUsdCents: BigInt(0),
};

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
  insuranceInfo: emptyContractInsuranceCarInfo,
  isGuestHasInsurance: false,
  dimoTokenId: BigInt(0),
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
  finishDateTime: BigInt(0),
  pickUpHash: "",
  returnHash: "",
  guestInsuranceCompanyName: "",
  guestInsurancePolicyNumber: "",
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
  insurancesInfo: [],
  paidForInsuranceInUsdCents: BigInt(0),
  guestDrivingLicenseIssueCountry: "",
  promoDiscount: BigInt(0),
  dimoTokenId: BigInt(0),
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
const emptyContractPromoDTO: ContractPromoDTO = {
  promoCode: "",
  promoCodeEnterDate: BigInt(0),
  promoCodeValueInPercents: BigInt(0),
};
const emptyContractAdminTripDTO: ContractAdminTripDTO = {
  trip: emptyContractTrip,
  carLocation: emptyContractLocationInfo,
  carMetadataURI: "",
  promoInfo: emptyContractPromoDTO,
};

export function validateContractAllTripsDTO(obj: ContractAllTripsDTO): obj is ContractAllTripsDTO {
  return (
    validateType(obj, emptyContractAllTripsDTO) &&
    (obj.trips.length === 0 ||
      (validateType(obj.trips[0], emptyContractAdminTripDTO) &&
        validateType(obj.trips[0].trip, emptyContractTrip) &&
        validateType(obj.trips[0].carLocation, emptyContractLocationInfo) &&
        validateType(obj.trips[0].promoInfo, emptyContractPromoDTO)))
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

const emptyContractInsuranceInfo: ContractInsuranceInfo = {
  companyName: "",
  policyNumber: "",
  photo: "",
  comment: "",
  insuranceType: InsuranceType.None,
  createdTime: BigInt(0),
  createdBy: "",
};

const emptyContractInsuranceDTO: ContractInsuranceDTO = {
  tripId: BigInt(0),
  carBrand: "",
  carModel: "",
  carYear: BigInt(0),
  insuranceInfo: emptyContractInsuranceInfo,
  createdByHost: false,
  creatorPhoneNumber: "",
  creatorFullName: "",
  startDateTime: BigInt(0),
  endDateTime: BigInt(0),
  isActual: false,
};

export function validateContractInsuranceDTO(obj: ContractInsuranceDTO): obj is ContractInsuranceDTO {
  return validateType(obj, emptyContractInsuranceDTO) && validateType(obj.insuranceInfo, emptyContractInsuranceInfo);
}

const emptyContractBaseDiscount: ContractBaseDiscount = {
  threeDaysDiscount: BigInt(0),
  sevenDaysDiscount: BigInt(0),
  thirtyDaysDiscount: BigInt(0),
  initialized: false,
};

const emptyContractAvailableCarDTO: ContractAvailableCarDTO = {
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
  insuranceInfo: emptyContractInsuranceCarInfo,
  carDiscounts: emptyContractBaseDiscount,
  fuelPrice: BigInt(0),
  salesTax: BigInt(0),
  governmentTax: BigInt(0),
  isGuestHasInsurance: false,
  distance: BigInt(0),
  dimoTokenId: BigInt(0),
};

export function validateContractAvailableCarDTO(obj: ContractAvailableCarDTO): obj is ContractAvailableCarDTO {
  return (
    validateType(obj, emptyContractAvailableCarDTO) &&
    validateType(obj.locationInfo, emptyContractLocationInfo) &&
    validateType(obj.insuranceInfo, emptyContractInsuranceCarInfo) &&
    validateType(obj.carDiscounts, emptyContractBaseDiscount)
  );
}

const emptyContractFilterInfoDTO: ContractFilterInfoDTO = {
  maxCarPrice: BigInt(0),
  minCarYearOfProduction: BigInt(0),
};

export function validateContractFilterInfoDTO(obj: ContractFilterInfoDTO): obj is ContractFilterInfoDTO {
  return validateType(obj, emptyContractFilterInfoDTO);
}

const emptyContractCheckPromoDTO: ContractCheckPromoDTO = {
  isFound: false,
  isValid: false,
  isDiscount: false,
  value: BigInt(0),
};

export function validateContractCheckPromoDTO(obj: ContractCheckPromoDTO): obj is ContractCheckPromoDTO {
  return validateType(obj, emptyContractCheckPromoDTO);
}

const emptyContractKYCInfo: ContractKYCInfo = {
  name: "",
  surname: "",
  mobilePhoneNumber: "",
  profilePhoto: "",
  licenseNumber: "",
  expirationDate: BigInt(0),
  createDate: BigInt(0),
  isTCPassed: false,
  TCSignature: "",
};

const emptyContractAdditionalKYCInfo: ContractAdditionalKYCInfo = {
  issueCountry: "",
  email: "",
};

const emptyContractAdminKYCInfoDTO: ContractAdminKYCInfoDTO = {
  kyc: emptyContractKYCInfo,
  additionalKYC: emptyContractAdditionalKYCInfo,
  wallet: "",
};

export function validateContractAdminKYCInfoDTO(obj: ContractAdminKYCInfoDTO): obj is ContractAdminKYCInfoDTO {
  return (
    validateType(obj, emptyContractAdminKYCInfoDTO) &&
    validateType(obj.kyc, emptyContractKYCInfo) &&
    validateType(obj.additionalKYC, emptyContractAdditionalKYCInfo)
  );
}
