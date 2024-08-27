import { ContractTransactionResponse } from "ethers";
import {
  ContractBaseDiscount,
  ContractCalculatePaymentsDTO,
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractChatInfo,
  ContractCreateCarRequest,
  ContractCreateClaimRequest,
  ContractCreateTripRequest,
  ContractCreateTripRequestWithDelivery,
  ContractDeliveryData,
  ContractDeliveryLocations,
  ContractDeliveryPrices,
  ContractFullClaimInfo,
  ContractKYCInfo,
  ContractLocationInfo,
  ContractPublicHostCarDTO,
  ContractSearchCar,
  ContractSearchCarParams,
  ContractSearchCarWithDistance,
  ContractSignedLocationInfo,
  ContractTripDTO,
  ContractTripReceiptDTO,
  ContractUpdateCarInfoRequest,
} from "./schemas";
import { LocationInfo } from "@/model/LocationInfo";

export interface IRentalityContract extends IRentalityPlatform {
  /// ADMIN functions
  owner(): Promise<string>;

  getCarServiceAddress(): Promise<string>;

  updateCarService(contractAddress: string): Promise<ContractTransactionResponse>;

  getCurrencyConverterServiceAddress(): Promise<string>;

  updateCurrencyConverterService(contractAddress: string): Promise<ContractTransactionResponse>;

  getTripServiceAddress(): Promise<string>;

  updateTripService(contractAddress: string): Promise<ContractTransactionResponse>;

  getUserServiceAddress(): Promise<string>;

  updateUserService(contractAddress: string): Promise<ContractTransactionResponse>;

  getRentalityPlatformAddress(): Promise<string>;

  updateRentalityPlatform(contractAddress: string): Promise<ContractTransactionResponse>;

  getPlatformFeeInPPM(): Promise<bigint>;

  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;

  getMyCars(): Promise<ContractCarInfoDTO[]>;

  getTripsAsHost(): Promise<ContractTripDTO[]>;

  getMyClaimsAsHost(): Promise<ContractFullClaimInfo[]>;

  getDiscount(user: string): Promise<ContractBaseDiscount>;

  /// GUEST functions
  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    user?: string
  ): Promise<ContractSearchCarWithDistance[]>;

  searchAvailableCarsWithDelivery(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUpInfo: ContractLocationInfo,
    returnInfo: ContractLocationInfo,
    user?: string
  ): Promise<ContractSearchCarWithDistance[]>;

  getTripsAsGuest(): Promise<ContractTripDTO[]>;

  getChatInfoForGuest(): Promise<ContractChatInfo[]>;

  getMyClaimsAsGuest(): Promise<ContractFullClaimInfo[]>;

  calculatePayments(carId: bigint, daysOfTrip: bigint, currency: string): Promise<ContractCalculatePaymentsDTO>;

  /// GENERAL functions
  address: string;

  owner(): Promise<string>;

  getCarMetadataURI(carId: bigint): Promise<string>;

  getCarDetails(carId: bigint): Promise<ContractCarDetails>;

  getTrip(tripId: bigint): Promise<ContractTripDTO>;

  getTripContactInfo(tripId: bigint): Promise<ContractTripContactInfo>;

  getMyKYCInfo(): Promise<ContractKYCInfo>;

  getCarsOfHost(host: string): Promise<ContractPublicHostCarDTO[]>;

  getClaim(claimId: bigint): Promise<ContractFullClaimInfo>;

  getDeliveryData(carId: bigint): Promise<ContractDeliveryData>;

  calculatePaymentsWithDelivery(
    carId: bigint,
    daysOfTrip: bigint,
    currency: string,
    pickUpLocation: ContractLocationInfo,
    returnLocation: ContractLocationInfo
  ): Promise<ContractCalculatePaymentsDTO>;

  getUserDeliveryPrices(user: string): Promise<ContractDeliveryPrices>;

  getKycCommission(): Promise<bigint>;

  calculateKycCommission(currency: string): Promise<bigint>;

  payKycCommission(amount: bigint, currency: string, value?: object): Promise<ContractTransactionResponse>;

  isKycCommissionPaid(user: string): Promise<boolean>;

  useKycCommission(user: string, value?: object): Promise<ContractTransactionResponse>;

  //not using
  getAllCars(): Promise<ContractCarInfo[]>;

  updateServiceAddresses(value?: object): Promise<ContractTransactionResponse>;

  getTripReceipt(tripId: bigint): Promise<ContractTripReceiptDTO>;

  getAvailableCars(): Promise<ContractCarInfo[]>;

  getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]>;
}

export interface IRentalityPlatform {
  parseGeoResponse(carId: bigint, value?: object): Promise<ContractTransactionResponse>;

  addUserDeliveryPrices(
    underTwentyFiveMilesInUsdCents: bigint,
    aboveTwentyFiveMilesInUsdCents: bigint,
    value?: object
  ): Promise<ContractTransactionResponse>;

  createTripRequestWithDelivery(
    request: ContractCreateTripRequestWithDelivery,
    value: object,
    quoteValue?: object
  ): Promise<ContractTransactionResponse>;

  setKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint,
    tcSignature: string,
    value?: object
  ): Promise<ContractTransactionResponse>;

  /// HOST functions
  addCar(request: ContractCreateCarRequest, value?: object): Promise<ContractTransactionResponse>;

  updateCarInfo(request: ContractUpdateCarInfoRequest, value?: object): Promise<ContractTransactionResponse>;

  updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: ContractSignedLocationInfo,
    apiKey: string,
    value?: object
  ): Promise<ContractTransactionResponse>;

  confirmCheckOut(tripId: bigint, value?: object): Promise<ContractTransactionResponse>;

  payClaim(amount: bigint, claimId: bigint, value: object, quoteValue?: object): Promise<ContractTransactionResponse>;

  checkInByGuest(tripId: bigint, panelParams: bigint[], value?: object): Promise<ContractTransactionResponse>;

  checkOutByGuest(tripId: bigint, panelParams: bigint[], value?: object): Promise<ContractTransactionResponse>;

  createTripRequest(
    request: ContractCreateTripRequest,
    value: object,
    quoteValue?: object
  ): Promise<ContractTransactionResponse>;

  createTripRequest(
    request: ContractCreateTripRequest,
    value: object,
    quoteValue?: object
  ): Promise<ContractTransactionResponse>;

  addUserDiscount(discounts: ContractBaseDiscount, value?: object): Promise<ContractTransactionResponse>;

  finishTrip(tripId: bigint, value?: object): Promise<ContractTransactionResponse>;

  createClaim(request: ContractCreateClaimRequest, value?: object): Promise<ContractTransactionResponse>;

  rejectClaim(claimId: bigint, value?: object): Promise<ContractTransactionResponse>;

  approveTripRequest(tripId: bigint, value?: object): Promise<ContractTransactionResponse>;

  rejectTripRequest(tripId: bigint, value?: object): Promise<ContractTransactionResponse>;

  checkInByHost(
    tripId: bigint,
    panelParams: bigint[],
    insuranceCompany: string,
    insuranceNumber: string,
    value?: object
  ): Promise<ContractTransactionResponse>;

  checkOutByHost(tripId: bigint, panelParams: bigint[], value?: object): Promise<ContractTransactionResponse>;

  getChatInfoForHost(): Promise<ContractChatInfo[]>;

  createClaim(request: ContractCreateClaimRequest, value?: object): Promise<ContractTransactionResponse>;

  rejectClaim(claimId: bigint, value?: object): Promise<ContractTransactionResponse>;
}

export interface IRentalitySender extends IRentalityPlatform {
  quoteAddCar(request: ContractCreateCarRequest): Promise<bigint>;

  quoteUpdateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: ContractSignedLocationInfo,
    apiKey: string
  ): Promise<bigint>;

  quoteUpdateCarInfo(request: ContractUpdateCarInfoRequest): Promise<bigint>;

  quoteApproveTripRequest(tripId: bigint): Promise<bigint>;

  quoteRejectTripRequest(tripId: bigint): Promise<bigint>;

  quoteCheckInByHost(
    tripId: bigint,
    panelParams: bigint[],
    insuranceCompany: string,
    insuranceNumber: string
  ): Promise<bigint>;

  quoteCheckOutByHost(tripId: bigint, panelParams: bigint[]): Promise<bigint>;

  quoteFinishTrip(tripId: bigint): Promise<bigint>;

  quoteCreateClaim(request: ContractCreateClaimRequest): Promise<bigint>;

  quoteRejectClaim(claimId: bigint): Promise<bigint>;

  quoteAddUserDiscount(discounts: ContractBaseDiscount): Promise<bigint>;

  quoteCreateTripRequest(value: number, request: ContractCreateTripRequest): Promise<bigint>;

  quoteCreateTripRequestWithDelivery(value: number, request: ContractCreateTripRequest): Promise<bigint>;

  quoteCheckInByGuest(tripId: bigint, panelParams: bigint[]): Promise<bigint>;

  quoteCheckOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<bigint>;

  quotePayClaim(value: number, claimId: bigint): Promise<bigint>;

  quoteConfirmCheckOut(tripId: bigint): Promise<bigint>;

  quoteSetKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint,
    tcSignature: string
  ): Promise<bigint>;

  quoteCreateTripRequestWithDelivery(value: number, request: ContractCreateTripRequestWithDelivery): Promise<bigint>;

  quoteAddUserDeliveryPrices(
    underTwentyFiveMilesInUsdCents: bigint,
    aboveTwentyFiveMilesInUsdCents: bigint
  ): Promise<bigint>;

  quotePayKycCommission(value: bigint, currency: string): Promise<bigint>;

  quoteUseKycCommission(user: string): Promise<bigint>;

  quoteParseGeoResponse(carId: bigint): Promise<bigint>;
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

  withdrawFromPlatform(amount: bigint): Promise<ContractTransactionResponse>;

  withdrawAllFromPlatform(): Promise<ContractTransactionResponse>;

  setPlatformFeeInPPM(valueInPPM: bigint): Promise<ContractTransactionResponse>;

  updateGeoServiceAddress(newGeoServiceAddress: string): Promise<ContractTransactionResponse>;

  updateGeoParserAddress(newGeoParserAddress: string): Promise<ContractTransactionResponse>;

  setClaimsWaitingTime(timeInSec: bigint): Promise<ContractTransactionResponse>;

  getClaimWaitingTime(): Promise<bigint>;

  getPlatformFeeInPPM(): Promise<bigint>;

  confirmCheckOut(tripId: bigint): Promise<ContractTransactionResponse>;

  rejectTripRequest(tripId: bigint): Promise<ContractTransactionResponse>;

  setCivicData(_civicVerifier: string, _civicGatekeeperNetwork: bigint): Promise<ContractTransactionResponse>;

  setNewTCMessage(message: string): Promise<ContractTransactionResponse>;

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
