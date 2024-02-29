import { ContractTransactionResponse } from "ethers";
import {
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoWithEditability,
  ContractChatInfo,
  ContractCreateCarRequest,
  ContractCreateClaimRequest,
  ContractCreateTripRequest,
  ContractFullClaimInfo,
  ContractKYCInfo,
  ContractSearchCar,
  ContractSearchCarParams,
  ContractTrip,
  ContractTripWithPhotoURL,
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
  getMyCars(): Promise<ContractCarInfoWithEditability[]>;
  getTripsAsHost(): Promise<ContractTripWithPhotoURL[]>;
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
  getTripsAsGuest(): Promise<ContractTripWithPhotoURL[]>;
  checkInByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  checkOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  getChatInfoForGuest(): Promise<ContractChatInfo[]>;
  payClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;
  getMyClaimsAsGuest(): Promise<ContractFullClaimInfo[]>;

  /// GENERAL functions
  address: string;
  //getAddress(): Promise<string>;
  getCarMetadataURI(carId: bigint): Promise<string>;
  getCarDetails(carId: bigint): Promise<ContractCarDetails>;
  getTrip(tripId: bigint): Promise<ContractTrip>;
  getTripContactInfo(tripId: bigint): Promise<ContractTripContactInfo>;
  getMyKYCInfo(): Promise<ContractKYCInfo>;
  setKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint,
    isTCPassed: boolean
  ): Promise<ContractTransactionResponse>;
  callOutdated(): Promise<ContractTripContactInfo>;

  //not using
  burnCar(carId: bigint): Promise<ContractCarInfo>;
  updateCarTokenUri(carId: bigint, tokenUri: string): Promise<ContractTransactionResponse>;
  getAvailableCars(): Promise<ContractCarInfo[]>;
  getAllCars(): Promise<ContractCarInfo[]>;
  getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]>;
  searchAvailableCarsForUser(
    user: string,
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractSearchCar[]>;
  getTripsByGuest(guest: string): Promise<ContractTripWithPhotoURL[]>;
  getTripsByHost(host: string): Promise<ContractTripWithPhotoURL[]>;
  getTripsByCar(carId: bigint): Promise<ContractTrip[]>;
  updateClaim(claimId: bigint): Promise<ContractTransactionResponse>;
  getClaim(claimId: bigint): Promise<ContractFullClaimInfo[]>;
  getClaimsByTrip(tripId: bigint): Promise<ContractFullClaimInfo[]>;
  getKYCInfo(user: string): Promise<ContractKYCInfo>;
  getCarsRentedByMe(): Promise<ContractCarInfo[]>;
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
  getEthToUsdRate(): Promise<{ ethToUsdRate: bigint; ethToUsdDecimals: number }>;

  getEthFromUsdLatest(
    valueInUsdCents: bigint
  ): Promise<{ valueInEth: bigint; ethToUsdRate: bigint; ethToUsdDecimals: number }>;
  getUsdFromEthLatest(
    valueInEth: bigint
  ): Promise<{ valueInUsdCents: bigint; ethToUsdRate: bigint; ethToUsdDecimals: number }>;
  getEthFromUsd(valueInUsdCents: bigint, ethToUsdRate: bigint, ethToUsdDecimals: number): Promise<bigint>;
  getUsdFromEth(valueInEth: bigint, ethToUsdRate: bigint, ethToUsdDecimals: number): Promise<bigint>;

  getEthToUsdRateWithCache(): Promise<{ ethToUsdRate: bigint; ethToUsdDecimals: number }>;
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
