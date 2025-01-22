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
  insuranceIncluded: boolean;
  locationHash: string;
};

export type ContractPublicHostCarDTO = {
  carId: bigint;
  metadataURI: string;
  brand: string;
  model: string;
  yearOfProduction: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  milesIncludedPerDay: bigint;
  currentlyListed: boolean;
};

export type ContractCarInfoDTO = {
  carInfo: ContractCarInfo;
  metadataURI: string;
  isEditable: boolean;
  dimoTokenId: number;
};

export type ContractCreateCarRequest = {
  tokenUri: string;
  carVinNumber: string;
  brand: string;
  model: string;
  yearOfProduction: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineParams: bigint[];
  engineType: EngineType;
  milesIncludedPerDay: bigint;
  timeBufferBetweenTripsInSec: bigint;
  geoApiKey: string;
  locationInfo: ContractSignedLocationInfo;
  currentlyListed: boolean;
  insuranceRequired: boolean;
  insurancePriceInUsdCents: bigint;
  dimoTokenId: bigint;
};

export type ContractUpdateCarInfoRequest = {
  carId: bigint;
  pricePerDayInUsdCents: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineParams: bigint[];
  milesIncludedPerDay: bigint;
  timeBufferBetweenTripsInSec: bigint;
  currentlyListed: boolean;
  insuranceRequired: boolean;
  insurancePriceInUsdCents: bigint;
  engineType: EngineType;
  tokenUri: string;
};

export type ContractSearchCarParams = {
  country: string;
  state: string;
  city: string;
  brand: string;
  model: string;
  yearOfProductionFrom: bigint;
  yearOfProductionTo: bigint;
  pricePerDayInUsdCentsFrom: bigint;
  pricePerDayInUsdCentsTo: bigint;
  userLocation: ContractLocationInfo;
};

export type ContractCreateTripRequest = {
  carId: bigint;
  startDateTime: bigint;
  endDateTime: bigint;
  currencyType: string;
};

export type ContractCreateTripRequestWithDelivery = {
  carId: bigint;
  startDateTime: bigint;
  endDateTime: bigint;
  currencyType: string;
  pickUpInfo: ContractSignedLocationInfo;
  returnInfo: ContractSignedLocationInfo;
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
  milesIncludedPerDay: bigint;
  fuelPrice: bigint;
  paymentInfo: ContractPaymentInfo;
  createdDateTime: bigint;
  approvedDateTime: bigint;
  rejectedDateTime: bigint;
  guestInsuranceCompanyName: string;
  guestInsurancePolicyNumber: string;
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
  finishDateTime: bigint;
  pickUpHash: string;
  returnHash: string;
};

export type ContractTripDTO = {
  trip: ContractTrip;
  guestPhotoUrl: string;
  hostPhotoUrl: string;
  metadataURI: string;
  timeZoneId: string;
  hostDrivingLicenseNumber: string;
  hostDrivingLicenseExpirationDate: bigint;
  guestDrivingLicenseNumber: string;
  guestDrivingLicenseExpirationDate: bigint;
  model: string;
  brand: string;
  yearOfProduction: bigint;
  pickUpLocation: ContractLocationInfo;
  returnLocation: ContractLocationInfo;
  guestPhoneNumber: string;
  hostPhoneNumber: string;
  insurancesInfo: ContractInsuranceInfo[];
  paidForInsuranceInUsdCents: bigint;
  guestDrivingLicenseIssueCountry: string;
  promoDiscount: bigint;
  dimoTokenId: bigint;
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
  carYearOfProduction: bigint;
  carMetadataUrl: string;
  startDateTime: bigint;
  endDateTime: bigint;
  timeZoneId: string;
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
  amountInEth: bigint;
  timeZoneId: string;
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
  photosUrl: string;
  isHostClaims: boolean;
};

export type ContractCreateClaimRequest = {
  tripId: bigint;
  claimType: ClaimType;
  description: string;
  amountInUsdCents: bigint;
  photosUrl: string;
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
  salesTax: bigint;
  governmentTax: bigint;
  priceWithDiscount: bigint;
  depositInUsdCents: bigint;
  resolveAmountInUsdCents: bigint;
  currencyType: string;
  currencyRate: bigint;
  currencyDecimals: bigint;
  resolveFuelAmountInUsdCents: bigint;
  resolveMilesAmountInUsdCents: bigint;
  pickUpFee: bigint;
  dropOfFee: bigint;
};

export type ContractTripReceiptDTO = {
  totalDayPriceInUsdCents: bigint;
  totalTripDays: bigint;
  tripPrice: bigint;
  discountAmount: bigint;
  salesTax: bigint;
  governmentTax: bigint;
  depositReceived: bigint;
  reimbursement: bigint;
  depositReturned: bigint;
  refuel: bigint;
  refuelPricePerUnit: bigint;
  refuelOrRechargeTotalPrice: bigint;
  milesIncluded: bigint;
  overmiles: bigint;
  pricePerOvermileInCents: bigint;
  overmileCharge: bigint;
  startFuelLevel: bigint;
  endFuelLevel: bigint;
  startOdometer: bigint;
  endOdometer: bigint;
  insuranceFee: bigint;
};

export type ContractCalculatePaymentsDTO = {
  totalPrice: bigint;
  currencyRate: bigint;
  currencyDecimals: bigint;
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
  TCSignature: string;
};

export type ContractCivicKYCInfo = {
  fullName: string;
  licenseNumber: string;
  expirationDate: bigint;
  issueCountry: string;
  email: string;
};

export type ContractAdditionalKYCInfo = {
  issueCountry: string;
  email: string;
};

export type ContractFullKYCInfoDTO = {
  kyc: ContractKYCInfo;
  additionalKYC: ContractAdditionalKYCInfo;
};

export type ContractSearchCarWithDistance = {
  car: ContractSearchCar;
  distance: bigint;
};

export type ContractSearchCar = {
  carId: bigint;
  brand: string;
  model: string;
  yearOfProduction: bigint;
  pricePerDayInUsdCents: bigint;
  pricePerDayWithDiscount: bigint;
  tripDays: bigint;
  totalPriceWithDiscount: bigint;
  taxes: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineType: EngineType;
  milesIncludedPerDay: bigint;
  host: string;
  hostName: string;
  hostPhotoUrl: string;
  metadataURI: string;
  underTwentyFiveMilesInUsdCents: bigint;
  aboveTwentyFiveMilesInUsdCents: bigint;
  pickUp: bigint;
  dropOf: bigint;
  insuranceIncluded: boolean;
  locationInfo: ContractLocationInfo;
  insuranceInfo: ContractInsuranceCarInfo;
  isGuestHasInsurance: boolean;
};

export type ContractAvailableCarDTO = {
  carId: bigint;
  brand: string;
  model: string;
  yearOfProduction: bigint;
  pricePerDayInUsdCents: bigint;
  pricePerDayWithDiscount: bigint;
  tripDays: bigint;
  totalPriceWithDiscount: bigint;
  taxes: bigint;
  securityDepositPerTripInUsdCents: bigint;
  engineType: EngineType;
  milesIncludedPerDay: bigint;
  host: string;
  hostName: string;
  hostPhotoUrl: string;
  metadataURI: string;
  underTwentyFiveMilesInUsdCents: bigint;
  aboveTwentyFiveMilesInUsdCents: bigint;
  pickUp: bigint;
  dropOf: bigint;
  insuranceIncluded: boolean;
  locationInfo: ContractLocationInfo;
  insuranceInfo: ContractInsuranceCarInfo;
  fuelPrice: bigint;
  carDiscounts: ContractBaseDiscount;
  salesTax: bigint;
  governmentTax: bigint;
  distance: bigint;
  isGuestHasInsurance: boolean;
};

export type ContractGeoData = {
  city: string;
  country: string;
  state: string;
  locationLatitude: string;
  locationLongitude: string;
  timeZoneId: string;
  metadataURI: string;
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
  locationInfo: ContractLocationInfo;
  carVinNumber: string;
  carMetadataURI: string;
  dimoTokenId: bigint;
};

export type ContractFloridaTaxes = {
  salesTaxPPM: bigint;
  governmentTaxPerDayInUsdCents: bigint;
};

export type ContractBaseDiscount = {
  threeDaysDiscount: bigint;
  sevenDaysDiscount: bigint;
  thirtyDaysDiscount: bigint;
  initialized: boolean;
};

export type ContractDeliveryPrices = {
  underTwentyFiveMilesInUsdCents: bigint;
  aboveTwentyFiveMilesInUsdCents: bigint;
  initialized: boolean;
};

export type ContractDeliveryLocations = {
  pickUpLat: string;
  pickUpLon: string;
  returnLat: string;
  returnLon: string;
};

export type ContractDeliveryData = {
  locationInfo: ContractLocationInfo;
  underTwentyFiveMilesInUsdCents: bigint;
  aboveTwentyFiveMilesInUsdCents: bigint;
  insuranceIncluded: boolean;
};

export type ContractLocationInfo = {
  userAddress: string;
  country: string;
  state: string;
  city: string;
  latitude: string;
  longitude: string;
  timeZoneId: string;
};

export type ContractSignedLocationInfo = {
  locationInfo: ContractLocationInfo;
  signature: string;
};

export type ContractKycCommissionData = {
  paidTime: bigint;
  commissionPaid: boolean;
};

export type ContractTripFilter = {
  paymentStatus: PaymentStatus;
  status: AdminTripStatus;
  location: ContractLocationInfo;
  startDateTime: bigint;
  endDateTime: bigint;
};

export type ContractAdminTripDTO = {
  trip: ContractTrip;
  carMetadataURI: string;
  carLocation: ContractLocationInfo;
  promoInfo: ContractPromoDTO;
};

export type ContractAllTripsDTO = {
  trips: ContractAdminTripDTO[];
  totalPageCount: bigint;
};

export type ContractAdminCarDTO = {
  car: ContractCarDetails;
  carMetadataURI: string;
};

export type ContractAllCarsDTO = {
  cars: ContractAdminCarDTO[];
  totalPageCount: bigint;
};

export type ContractReadyToClaim = {
  points: bigint;
  refType: RefferalProgram;
  oneTime: boolean;
};

export type ContractReadyToClaimRefferalHash = {
  points: bigint;
  refType: RefferalProgram;
  oneTime: boolean;
  claimed: boolean;
};

export type ContractReadyToClaimFromHash = {
  points: bigint;
  refType: RefferalProgram;
  oneTime: boolean;
  claimed: boolean;
  user: string;
};

export type ContractTearPoints = {
  from: bigint;
  to: bigint;
};

export type ContractRefferalDiscount = {
  pointsCosts: bigint;
  percents: bigint;
};

export type ContractTearDTO = {
  points: ContractTearPoints;
  tear: Tear;
};

export type ContractReadyToClaimDTO = {
  toClaim: ContractReadyToClaim[];
  totalPoints: bigint;
  toNextDailyClaim: bigint;
};

export type ContractRefferalHashDTO = {
  toClaim: ContractReadyToClaimFromHash[];
  totalPoints: bigint;
  hash: string;
};

export type ContractRefferalProgramInfoDTO = {
  refferalType: RefferalAccrualType;
  method: RefferalProgram;
  points: bigint;
};

export type ContractHashPointsDTO = {
  method: RefferalProgram;
  points: bigint;
};

export type ContractRefferalDiscountsDTO = {
  method: RefferalProgram;
  tear: Tear;
  discount: ContractRefferalDiscount;
};

export type ContractAllRefferalInfoDTO = {
  programPoints: ContractRefferalProgramInfoDTO[];
  hashPoints: ContractHashPointsDTO[];
  discounts: ContractRefferalDiscountsDTO[];
  tear: ContractTearDTO[];
};

export type ContractRefferalHistory = {
  points: bigint;
  method: RefferalProgram;
};

export type ContractHistory = {
  points: bigint;
  date: bigint;
  method: RefferalProgram;
};

export type ContractProgramHistory = {
  points: bigint;
  date: bigint;
  method: RefferalProgram;
  oneTime: boolean;
};

export type ContractFilterInfoDTO = {
  maxCarPrice: bigint;
  minCarYearOfProduction: bigint;
};

export type ContractInsuranceCarInfo = {
  required: boolean;
  priceInUsdCents: bigint;
};

export type ContractSaveInsuranceRequest = {
  companyName: string;
  policyNumber: string;
  photo: string;
  comment: string;
  insuranceType: InsuranceType;
};

export type ContractInsuranceInfo = {
  companyName: string;
  policyNumber: string;
  photo: string;
  comment: string;
  insuranceType: InsuranceType;
  createdTime: bigint;
  createdBy: string;
};

export type ContractInsuranceDTO = {
  tripId: bigint;
  carBrand: string;
  carModel: string;
  carYear: bigint;
  insuranceInfo: ContractInsuranceInfo;
  createdByHost: boolean;
  creatorPhoneNumber: string;
  creatorFullName: string;
  startDateTime: bigint;
  endDateTime: bigint;
  isActual: boolean;
};

export type ContractCarInfoWithInsurance = {
  carInfo: ContractCarInfo;
  insuranceInfo: ContractInsuranceCarInfo;
  carMetadataURI: string;
};

export type ContractPromoUsedInfo = {
  promo: ContractPromo;
  promoCode: string;
  usedAt: bigint;
};

export type ContractPromo = {
  promoType: PromoType;
  code: string;
  startDate: bigint;
  expireDate: bigint;
  createdBy: string;
  createdAt: bigint;
  status: PromoStatus;
};

export type ContractPromoTripData = {
  promo: string;
  hostEarningsInCurrency: bigint;
  hostEarnings: bigint;
};

export type ContractCheckPromoDTO = {
  isFound: boolean;
  isValid: boolean;
  isDiscount: boolean;
  value: bigint;
};

export type ContractPromoDTO = {
  promoCode: string;
  promoCodeValueInPercents: bigint;
  promoCodeEnterDate: bigint;
};

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

  CompletedWithoutGuestComfirmation: BigInt(100), //Finished
};

export type ClaimType = bigint;
export const ClaimType = {
  Tolls: BigInt(0),
  Tickets: BigInt(1),
  LateReturn: BigInt(2),
  Smoking: BigInt(3),
  Cleanliness: BigInt(4),
  ExteriorDamage: BigInt(5),
  InteriorDamage: BigInt(6),
  Other: BigInt(7),
  FaultyVehicle: BigInt(8),
  ListingMismatch: BigInt(9),
};

export type ClaimStatus = bigint;
export const ClaimStatus = {
  NotPaid: BigInt(0),
  Paid: BigInt(1),
  Cancel: BigInt(2),
  Overdue: BigInt(3),
};

export type CurrencyType = bigint;
export const CurrencyType = {
  ETH: BigInt(0),
};

export type TaxesLocationType = bigint;
export const TaxesLocationType = {
  City: BigInt(0),
  State: BigInt(1),
  Country: BigInt(2),
};

export type PaymentStatus = bigint;
export const PaymentStatus = {
  Any: BigInt(0),
  PaidToHost: BigInt(1),
  Unpaid: BigInt(2),
  RefundToGuest: BigInt(3),
  Prepayment: BigInt(4),
};

export type AdminTripStatus = bigint;
export const AdminTripStatus = {
  Any: BigInt(0),
  Created: BigInt(1),
  Approved: BigInt(2),
  CheckedInByHost: BigInt(3),
  CheckedInByGuest: BigInt(4),
  CheckedOutByGuest: BigInt(5),
  CheckedOutByHost: BigInt(6),
  Finished: BigInt(7),
  GuestCanceledBeforeApprove: BigInt(8),
  HostCanceledBeforeApprove: BigInt(9),
  GuestCanceledAfterApprove: BigInt(10),
  HostCanceledAfterApprove: BigInt(11),
  CompletedWithoutGuestConfirmation: BigInt(12),
  CompletedByGuest: BigInt(13),
  CompletedByAdmin: BigInt(14),
};

export type Role = bigint;
export const Role = {
  Guest: BigInt(0),
  Host: BigInt(1),
  Manager: BigInt(2),
  Admin: BigInt(3),
  KYCManager: BigInt(4),
};

export type RefferalProgram = bigint;
export const RefferalProgram = {
  SetKYC: BigInt(0),
  PassCivic: BigInt(1),
  AddCar: BigInt(2),
  CreateTrip: BigInt(3),
  FinishTripAsGuest: BigInt(4),
  UnlistedCar: BigInt(5),
  Daily: BigInt(6),
  DailyListing: BigInt(7),
  AddFirstCar: BigInt(8),
  FinishTripAsHost: BigInt(9),
};

export type Tear = bigint;
export const Tear = {
  Tear1: BigInt(0),
  Tear2: BigInt(1),
  Tear3: BigInt(2),
  Tear4: BigInt(3),
};

export type RefferalAccrualType = bigint;
export const RefferalAccrualType = {
  OneTime: BigInt(0),
  Permanent: BigInt(1),
};

export type CarUpdateStatus = bigint;
export const CarUpdateStatus = {
  Add: BigInt(0),
  Update: BigInt(1),
  Burn: BigInt(2),
};

export type EventType = bigint;
export const EventType = {
  Car: BigInt(0),
  Claim: BigInt(1),
  Trip: BigInt(2),
};

export type InsuranceType = bigint;
export const InsuranceType = {
  None: BigInt(0),
  General: BigInt(1),
  OneTime: BigInt(2),
};

export type PromoType = bigint;
export const PromoType = {
  OneTime: BigInt(0),
  Wildcard: BigInt(1),
};

export type PromoStatus = bigint;
export const PromoStatus = {
  Active: BigInt(0),
  Idle: BigInt(1),
  Used: BigInt(2),
};

export type EngineType = bigint;
export const EngineType = {
  PETROL: BigInt(1),
  ELECTRIC: BigInt(2),
};
