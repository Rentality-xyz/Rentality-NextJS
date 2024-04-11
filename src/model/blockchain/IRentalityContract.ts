import { ContractTransactionResponse } from "ethers";
import {
  ContractCalculatePaymentsDTO,
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractChatInfo,
  ContractCreateCarRequest,
  ContractCreateClaimRequest,
  ContractCreateTripRequest,
  ContractFullClaimInfo,
  ContractKYCInfo,
  ContractPublicHostCarDTO,
  ContractSearchCar,
  ContractSearchCarParams,
  ContractTripDTO,
  ContractUpdateCarInfoRequest,
} from "./schemas";

export interface IRentalityContract {
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

  /// HOST functions
  addCar(request: ContractCreateCarRequest): Promise<ContractTransactionResponse>;
  updateCarInfo(request: ContractUpdateCarInfoRequest): Promise<ContractTransactionResponse>;
  updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: string,
    locationLatitude: string,
    locationLongitude: string,
    geoApiKey: string
  ): Promise<ContractTransactionResponse>;
  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;
  getMyCars(): Promise<ContractCarInfoDTO[]>;
  getTripsAsHost(): Promise<ContractTripDTO[]>;
  approveTripRequest(tripId: bigint): Promise<ContractTransactionResponse>;
  rejectTripRequest(tripId: bigint): Promise<ContractTransactionResponse>;
  checkInByHost(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  checkOutByHost(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  finishTrip(tripId: bigint): Promise<ContractTransactionResponse>;
  getChatInfoForHost(): Promise<ContractChatInfo[]>;
  createClaim(request: ContractCreateClaimRequest): Promise<ContractTransactionResponse>;
  rejectClaim(claimId: bigint): Promise<ContractTransactionResponse>;
  getMyClaimsAsHost(): Promise<ContractFullClaimInfo[]>;

  /// GUEST functions
  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractSearchCar[]>;
  createTripRequest(request: ContractCreateTripRequest, value: object): Promise<ContractTransactionResponse>;
  getTripsAsGuest(): Promise<ContractTripDTO[]>;
  checkInByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  checkOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  getChatInfoForGuest(): Promise<ContractChatInfo[]>;
  payClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;
  getMyClaimsAsGuest(): Promise<ContractFullClaimInfo[]>;
  calculatePayments(carId: bigint, daysOfTrip: bigint, currency: string): Promise<ContractCalculatePaymentsDTO>;

  /// GENERAL functions
  address: string;
  getCarMetadataURI(carId: bigint): Promise<string>;
  getCarDetails(carId: bigint): Promise<ContractCarDetails>;
  getTrip(tripId: bigint): Promise<ContractTripDTO>;
  getTripContactInfo(tripId: bigint): Promise<ContractTripContactInfo>;
  getMyKYCInfo(): Promise<ContractKYCInfo>;
  setKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint,
    tcSignature: string
  ): Promise<ContractTransactionResponse>;
  getCarsOfHost(host: string): Promise<ContractPublicHostCarDTO[]>;
  getClaim(claimId: bigint): Promise<ContractFullClaimInfo>;

  //not using
  getAllCars(): Promise<ContractCarInfo[]>;
}

export interface IRentalityAdminGateway {
  withdrawFromPlatform(amount: bigint): Promise<ContractTransactionResponse>;
  withdrawAllFromPlatform(): Promise<ContractTransactionResponse>;
  setPlatformFeeInPPM(valueInPPM: bigint): Promise<ContractTransactionResponse>;
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

type ContractTripContactInfo = {
  guestPhoneNumber: string;
  hostPhoneNumber: string;
};
