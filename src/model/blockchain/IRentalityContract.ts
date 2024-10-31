import { ContractTransactionResponse } from "ethers";
import {
  ContractAllCarsDTO,
  ContractAllTripsDTO,
  ContractAvailableCarDTO,
  ContractBaseDiscount,
  ContractCalculatePaymentsDTO,
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractCarInfoWithInsurance,
  ContractChatInfo,
  ContractCivicKYCInfo,
  ContractCreateCarRequest,
  ContractCreateClaimRequest,
  ContractCreateTripRequest,
  ContractCreateTripRequestWithDelivery,
  ContractDeliveryData,
  ContractDeliveryPrices,
  ContractFullClaimInfo,
  ContractFullKYCInfoDTO,
  ContractInsuranceDTO,
  ContractInsuranceInfo,
  ContractLocationInfo,
  ContractPublicHostCarDTO,
  ContractSaveInsuranceRequest,
  ContractSearchCarParams,
  ContractSearchCarWithDistance,
  ContractSignedLocationInfo,
  ContractTripDTO,
  ContractTripFilter,
  ContractTripReceiptDTO,
  ContractUpdateCarInfoRequest,
  Role,
} from "./schemas";

export interface IRentalityContract {
  /// USER PROFILE functions
  getMyFullKYCInfo(): Promise<ContractFullKYCInfoDTO>;
  setKYCInfo(
    nickName: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    TCSignature: string
  ): Promise<ContractTransactionResponse>;
  setCivicKYCInfo(user: string, civicKycInfo: ContractCivicKYCInfo): Promise<ContractTransactionResponse>;
  getKycCommission(): Promise<bigint>;
  calculateKycCommission(currency: string): Promise<bigint>;
  payKycCommission(currency: string, value: object): Promise<ContractTransactionResponse>;
  isKycCommissionPaid(user: string): Promise<boolean>;
  useKycCommission(user: string): Promise<ContractTransactionResponse>;

  /// HOST CARS functions
  addCar(request: ContractCreateCarRequest): Promise<ContractTransactionResponse>;
  updateCarInfo(request: ContractUpdateCarInfoRequest): Promise<ContractTransactionResponse>;
  updateCarTokenUri(carId: bigint, tokenUri: string): Promise<ContractTransactionResponse>;
  updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: ContractSignedLocationInfo,
    geoApiKey: string
  ): Promise<ContractTransactionResponse>;
  updateCarTokenUri(carId: bigint, tokenUri: string): Promise<ContractTransactionResponse>;
  getMyCars(): Promise<ContractCarInfoDTO[]>;
  getCarsOfHost(host: string): Promise<ContractPublicHostCarDTO[]>;
  getCarMetadataURI(carId: bigint): Promise<string>;
  getCarInfoById(carId: bigint): Promise<ContractCarInfoWithInsurance>;
  getCarDetails(carId: bigint): Promise<ContractCarDetails>;

  getDiscount(user: string): Promise<ContractBaseDiscount>;
  addUserDiscount(discounts: ContractBaseDiscount): Promise<ContractTransactionResponse>;
  addUserDeliveryPrices(
    underTwentyFiveMilesInUsdCents: bigint,
    aboveTwentyFiveMilesInUsdCents: bigint
  ): Promise<ContractTransactionResponse>;
  getUserDeliveryPrices(user: string): Promise<ContractDeliveryPrices>;
  getDeliveryData(carId: bigint): Promise<ContractDeliveryData>;

  /// TRIPS functions
  /// GENERAL
  getTripsAs(host: boolean): Promise<ContractTripDTO[]>;
  getTrip(tripId: bigint): Promise<ContractTripDTO>;
  getTripContactInfo(tripId: bigint): Promise<ContractTripContactInfo>;

  ///   HOST
  approveTripRequest(tripId: bigint): Promise<ContractTransactionResponse>;
  rejectTripRequest(tripId: bigint): Promise<ContractTransactionResponse>;
  checkInByHost(
    tripId: bigint,
    panelParams: bigint[],
    insuranceCompany: string,
    insuranceNumber: string
  ): Promise<ContractTransactionResponse>;
  checkOutByHost(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  finishTrip(tripId: bigint): Promise<ContractTransactionResponse>;

  ///   GUEST
  searchAvailableCarsWithDelivery(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUpInfo: ContractLocationInfo,
    returnInfo: ContractLocationInfo
  ): Promise<ContractSearchCarWithDistance[]>;
  checkCarAvailabilityWithDelivery(
    carId: bigint,
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUpInfo: ContractLocationInfo,
    returnInfo: ContractLocationInfo
  ): Promise<ContractAvailableCarDTO>;
  calculatePaymentsWithDelivery(
    carId: bigint,
    daysOfTrip: bigint,
    currency: string,
    pickUpLocation: ContractLocationInfo,
    returnLocation: ContractLocationInfo
  ): Promise<ContractCalculatePaymentsDTO>;
  createTripRequestWithDelivery(
    request: ContractCreateTripRequestWithDelivery,
    value: object
  ): Promise<ContractTransactionResponse>;
  checkInByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  checkOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  confirmCheckOut(tripId: bigint): Promise<ContractTransactionResponse>;

  // CLAIMS functions
  getMyClaimsAs(host: boolean): Promise<ContractFullClaimInfo[]>;
  getClaim(claimId: bigint): Promise<ContractFullClaimInfo>;
  createClaim(request: ContractCreateClaimRequest): Promise<ContractTransactionResponse>;
  calculateClaimValue(claimId: bigint): Promise<bigint>;
  payClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;
  rejectClaim(claimId: bigint): Promise<ContractTransactionResponse>;

  // CHAT functions
  getChatInfoFor(host: boolean): Promise<ContractChatInfo[]>;

  //INSURANCE functions
  getInsurancesBy(host: boolean): Promise<ContractInsuranceDTO[]>;
  getMyInsurancesAsGuest(): Promise<ContractInsuranceInfo[]>;
  saveTripInsuranceInfo(
    tripId: bigint,
    insuranceInfo: ContractSaveInsuranceRequest
  ): Promise<ContractTransactionResponse>;
  saveGuestInsurance(insuranceInfo: ContractSaveInsuranceRequest): Promise<ContractTransactionResponse>;

  /// GENERAL functions
  address: string;
  owner(): Promise<string>;

  // temporary is not working (reversed)
  isCarDetailsConfirmed(carId: bigint): Promise<boolean>;
  confirmCarDetails(carId: bigint): Promise<ContractTransactionResponse>;

  //not using
  updateServiceAddresses(): Promise<ContractTransactionResponse>;
  getAllCars(): Promise<ContractCarInfo[]>;
  getTripReceipt(tripId: bigint): Promise<ContractTripReceiptDTO>;
  getAvailableCars(): Promise<ContractCarInfo[]>;
  getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]>;
}

export interface IRentalityAdminGateway {
  address: string;
  owner(): Promise<string>;
  getCarServiceAddress(): Promise<string>;
  updateCarService(contractAddress: string): Promise<ContractTransactionResponse>;
  getPaymentService(): Promise<string>;
  updatePaymentService(contractAddress: string): Promise<ContractTransactionResponse>;
  getClaimServiceAddress(): Promise<string>;
  updateClaimService(contractAddress: string): Promise<ContractTransactionResponse>;
  getRentalityPlatformAddress(): Promise<string>;
  updateRentalityPlatform(contractAddress: string): Promise<ContractTransactionResponse>;
  getCurrencyConverterServiceAddress(): Promise<string>;
  updateCurrencyConverterService(contractAddress: string): Promise<ContractTransactionResponse>;
  getTripServiceAddress(): Promise<string>;
  updateTripService(contractAddress: string): Promise<ContractTransactionResponse>;
  getUserServiceAddress(): Promise<string>;
  updateUserService(contractAddress: string): Promise<ContractTransactionResponse>;
  withdrawFromPlatform(amount: bigint, currencyType: string): Promise<ContractTransactionResponse>;
  withdrawAllFromPlatform(currencyType: string): Promise<ContractTransactionResponse>;
  setPlatformFeeInPPM(valueInPPM: bigint): Promise<ContractTransactionResponse>;
  updateGeoServiceAddress(newGeoServiceAddress: string): Promise<ContractTransactionResponse>;
  setClaimsWaitingTime(timeInSec: bigint): Promise<ContractTransactionResponse>;
  getClaimWaitingTime(): Promise<bigint>;
  getPlatformFeeInPPM(): Promise<bigint>;
  setCivicData(_civicVerifier: string, _civicGatekeeperNetwork: bigint): Promise<ContractTransactionResponse>;
  setNewTCMessage(message: string): Promise<ContractTransactionResponse>;

  manageRole(role: Role, user: string, grant: boolean): Promise<ContractTransactionResponse>;
  getAllTrips(filter: ContractTripFilter, page: bigint, itemsPerPage: bigint): Promise<ContractAllTripsDTO>;
  getAllCars(page: bigint, itemsPerPage: bigint): Promise<ContractAllCarsDTO>;
  payToHost(tripId: bigint): Promise<ContractTransactionResponse>;
  refundToGuest(tripId: bigint): Promise<ContractTransactionResponse>;

  getKycCommission(): Promise<bigint>;
  setKycCommission(valueInUsdCents: bigint): Promise<ContractTransactionResponse>;
}

export interface IRentalityChatHelperContract {
  setMyChatPublicKey(chatPrivateKey: string, chatPublicKey: string): Promise<ContractTransactionResponse>;
  getMyChatKeys(): Promise<[string, string]>;
  getChatPublicKeys(addresses: string[]): Promise<ContractAddressPublicKey[]>;
}

export interface IRentalityCurrencyConverterContract {
  getLatestEthToUsdRate(): Promise<bigint>;
  getEthToUsdRate(): Promise<{ ethToUsdRate: bigint; ethToUsdDecimals: bigint }>;

  getEthFromUsdLatest(
    valueInUsdCents: bigint
  ): Promise<{ valueInEth: bigint; ethToUsdRate: bigint; ethToUsdDecimals: bigint }>;
  getUsdFromEthLatest(
    valueInEth: bigint
  ): Promise<{ valueInUsdCents: bigint; ethToUsdRate: bigint; ethToUsdDecimals: bigint }>;
  getEthFromUsd(valueInUsdCents: bigint, ethToUsdRate: bigint, ethToUsdDecimals: bigint): Promise<bigint>;
  getUsdFromEth(valueInEth: bigint, ethToUsdRate: bigint, ethToUsdDecimals: bigint): Promise<bigint>;

  getEthToUsdRateWithCache(): Promise<{ ethToUsdRate: bigint; ethToUsdDecimals: bigint }>;
  getEthFromUsdWithCache(valueInUsdCents: bigint): Promise<bigint>;
  getUsdFromEthWithCache(valueInEth: bigint): Promise<bigint>;
}

type ContractChatKeyInfo = {
  privateKey: string;
  publicKey: string;
};

type ContractAddressPublicKey = {
  userAddress: string;
  publicKey: string;
};

export type ContractTripContactInfo = {
  guestPhoneNumber: string;
  hostPhoneNumber: string;
};
