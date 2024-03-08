export type ContractCarInfo = {
  carId: bigint;
  carVinNumber: string;
  carVinNumberHash: string;
  createdBy: string;
  brand: string;
  model: string;
  yearOfProduction: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineType: EngineType;
  engineParams: bigint[];
  milesIncludedPerDay: bigint;
  timeBufferBetweenTripsInSec: bigint;
  currentlyListed: boolean;
  geoVerified: boolean;
  timeZoneId: string;
};

export type ContractCarInfoDTO = {
  carInfo: ContractCarInfo;
  metadataURI: string;
  isEditable: boolean;
};

export type ContractCreateCarRequest = {
  tokenUri: string;
  carVinNumber: string;
  brand: string;
  model: string;
  yearOfProduction: number;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineParams: bigint[];
  engineType: EngineType;
  milesIncludedPerDay: bigint;
  timeBufferBetweenTripsInSec: number;
  locationAddress: string;
  locationLatitude: string;
  locationLongitude: string;
  geoApiKey: string;
};

export type ContractUpdateCarInfoRequest = {
  carId: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineParams: bigint[];
  milesIncludedPerDay: bigint;
  timeBufferBetweenTripsInSec: number;
  currentlyListed: boolean;
};

export type ContractSearchCarParams = {
  country: string;
  state: string;
  city: string;
  brand: string;
  model: string;
  yearOfProductionFrom: number;
  yearOfProductionTo: number;
  pricePerDayInUsdCentsFrom: bigint;
  pricePerDayInUsdCentsTo: bigint;
};

export type ContractCreateTripRequest = {
  carId: bigint;
  host: string;
  startDateTime: bigint;
  endDateTime: bigint;
  startLocation: string;
  endLocation: string;
  totalDayPriceInUsdCents: bigint;
  taxPriceInUsdCents: bigint;
  depositInUsdCents: bigint;
  ethToCurrencyRate: bigint;
  ethToCurrencyDecimals: number;
};

export type ContractTransactionInfo = {
  rentalityFee: bigint;
  depositRefund: bigint;
  tripEarnings: bigint;
  dateTime: bigint;
  statusBeforeCancellation: TripStatus;
};

export type ContractTrip = {
  tripId: bigint;
  carId: bigint;
  status: TripStatus;
  guest: string;
  host: string;
  guestName: string;
  hostName: string;
  pricePerDayInUsdCents: bigint;
  startDateTime: bigint;
  endDateTime: bigint;
  engineType: EngineType;
  startLocation: string;
  endLocation: string;
  milesIncludedPerDay: bigint;
  fuelPrice: bigint;
  paymentInfo: ContractPaymentInfo;
  createdDateTime: bigint;
  approvedDateTime: bigint;
  rejectedDateTime: bigint;
  rejectedBy: string;
  checkedInByHostDateTime: bigint;
  startParamLevels: bigint[];
  checkedInByGuestDateTime: bigint;
  tripStartedBy: string;
  checkedOutByGuestDateTime: bigint;
  tripFinishedBy: string;
  endParamLevels: bigint[];
  checkedOutByHostDateTime: bigint;
  transactionInfo: ContractTransactionInfo;
};

export type ContractTripDTO = {
  trip: ContractTrip;
  guestPhotoUrl: string;
  hostPhotoUrl: string;
  metadataURI: string;
  timeZoneId: string;
};

export type ContractChatInfo = {
  tripId: bigint;
  guestAddress: string;
  guestName: string;
  guestPhotoUrl: string;
  hostAddress: string;
  hostName: string;
  hostPhotoUrl: string;
  tripStatus: bigint;
  carBrand: string;
  carModel: string;
  carYearOfProduction: number;
  carMetadataUrl: string;
  startDateTime: bigint;
  endDateTime: bigint;
};

export type ContractChatKeyPair = {
  privateKey: string;
  publicKey: string;
};

export type ContractAddressPublicKey = {
  userAddress: string;
  publicKey: string;
};

export type ContractFullClaimInfo = {
  claim: ContractClaim;
  host: string;
  guest: string;
  guestPhoneNumber: string;
  hostPhoneNumber: string;
  carInfo: ContractCarInfo;
};

export type ContractClaim = {
  tripId: bigint;
  claimId: bigint;
  deadlineDateInSec: bigint;
  claimType: ClaimType;
  status: ClaimStatus;
  description: string;
  amountInUsdCents: bigint;
  payDateInSec: bigint;
  rejectedBy: string;
  rejectedDateInSec: bigint;
};

export type ContractCreateClaimRequest = {
  tripId: bigint;
  claimType: ClaimType;
  description: string;
  amountInUsdCents: bigint;
};

export type ContractParsedGeolocationData = {
  status: string;
  validCoordinates: boolean;
  locationLat: string;
  locationLng: string;
  northeastLat: string;
  northeastLng: string;
  southwestLat: string;
  southwestLng: string;
  city: string;
  state: string;
  country: string;
  timeZoneId: string;
};

export type ContractPaymentInfo = {
  tripId: bigint;
  from: string;
  to: string;
  totalDayPriceInUsdCents: bigint;
  taxPriceInUsdCents: bigint;
  depositInUsdCents: bigint;
  resolveAmountInUsdCents: bigint;
  currencyType: CurrencyType;
  ethToCurrencyRate: bigint;
  ethToCurrencyDecimals: number;
  resolveFuelAmountInUsdCents: bigint;
  resolveMilesAmountInUsdCents: bigint;
};

export type ContractKYCInfo = {
  name: string;
  surname: string;
  mobilePhoneNumber: string;
  profilePhoto: string;
  licenseNumber: string;
  expirationDate: bigint;
  createDate: bigint;
  isTCPassed: boolean;
};

export type ContractSearchCar = {
  carId: bigint;
  brand: string;
  model: string;
  yearOfProduction: number;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineType: EngineType;
  milesIncludedPerDay: bigint;
  host: string;
  hostName: string;
  hostPhotoUrl: string;
  city: string;
  country: string;
  state: string;
  locationLatitude: string;
  locationLongitude: string;
  timeZoneId: string;
};

export type ContractCarDetails = {
  carId: bigint;
  hostName: string;
  hostPhotoUrl: string;
  host: string;
  brand: string;
  model: string;
  yearOfProduction: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  milesIncludedPerDay: bigint;
  engineType: EngineType;
  engineParams: bigint[];
  geoVerified: boolean;
  currentlyListed: boolean;
  timeZoneId: string;
  city: string;
  country: string;
  state: string;
  locationLatitude: string;
  locationLongitude: string;
};

export enum CurrencyType {
  ETH,
}

export type TripStatus = bigint;
export const TripStatus = {
  Pending: BigInt(0), // Created
  Confirmed: BigInt(1), // Approved
  CheckedInByHost: BigInt(2), // CheckedInByHost
  Started: BigInt(3), // CheckedInByGuest
  CheckedOutByGuest: BigInt(4), //CheckedOutByGuest
  Finished: BigInt(5), //CheckedOutByHost
  Closed: BigInt(6), //Finished
  Rejected: BigInt(7), //Canceled
};

export type ClaimStatus = bigint;
export const ClaimStatus = {
  NotPaid: BigInt(0),
  Paid: BigInt(1),
  Cancel: BigInt(2),
  Overdue: BigInt(3),
};

export type ClaimType = bigint;
export const ClaimType = {
  Tolls: BigInt(0),
  Tickets: BigInt(1),
  LateReturn: BigInt(2),
  Cleanliness: BigInt(3),
  Smoking: BigInt(4),
  ExteriorDamage: BigInt(5),
  InteriorDamage: BigInt(6),
  Other: BigInt(7),
};

export type EngineType = bigint;
export const EngineType = {
  PATROL: BigInt(1),
  ELECTRIC: BigInt(2),
};
