import { validateType } from "@/utils/typeValidator";
import {
  ClaimStatus,
  ClaimType,
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractChatInfo,
  ContractClaim,
  ContractFullClaimInfo,
  ContractSearchCar,
  ContractTransactionInfo,
  ContractTrip,
  ContractTripDTO,
  EngineType,
  TripStatus,
} from "./schemas";

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
  engineType: EngineType.PATROL,
  engineParams: [],
  geoVerified: false,
  timeZoneId: "",
  city: "",
  country: "",
  state: "",
  locationLatitude: "",
  locationLongitude: "",
  currentlyListed: false,
};

export function validateContractCarDetails(obj: ContractCarDetails): obj is ContractCarDetails {
  return validateType(obj, emptyContractCarDetails);
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

    carBrand: "",
    carModel: "",
    carYearOfProduction: 0,
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
  };

  return validateType(obj, emptyContractFullClaimInfo) && validateType(obj.claim, emptyContractClaim);
}

const emptyContractSearchCar: ContractSearchCar = {
  carId: BigInt(0),
  brand: "",
  model: "",
  yearOfProduction: 0,
  pricePerDayInUsdCents: BigInt(0),
  securityDepositPerTripInUsdCents: BigInt(0),
  engineType: EngineType.PATROL,
  milesIncludedPerDay: BigInt(0),
  host: "",
  hostName: "",
  hostPhotoUrl: "",
  city: "",
  country: "",
  state: "",
  locationLatitude: "",
  locationLongitude: "",
  timeZoneId: "",
};

export function validateContractSearchCar(obj: ContractSearchCar): obj is ContractSearchCar {
  return validateType(obj, emptyContractSearchCar);
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
  startLocation: "",
  endLocation: "",
  milesIncludedPerDay: BigInt(0),
  paymentInfo: {
    tripId: BigInt(0),
    from: "",
    to: "",
    totalDayPriceInUsdCents: BigInt(0),
    taxPriceInUsdCents: BigInt(0),
    depositInUsdCents: BigInt(0),
    resolveAmountInUsdCents: BigInt(0),
    currencyType: 0,
    ethToCurrencyRate: BigInt(0),
    ethToCurrencyDecimals: BigInt(0),
    resolveFuelAmountInUsdCents: BigInt(0),
    resolveMilesAmountInUsdCents: BigInt(0),
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
  engineType: EngineType.PATROL,
  fuelPrice: BigInt(0),
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
};

export function validateContractTripDTO(obj: ContractTripDTO): obj is ContractTripDTO {
  return validateType(obj, emptyContractTripDTO) && validateType(obj.trip, emptyContractTrip);
}
