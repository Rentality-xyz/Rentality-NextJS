import { ContractTransaction } from "ethers";
import { ContractAvailableCarInfo, ContractCarInfo } from "./ContractCarInfo";
import { ContractCreateTripRequest } from "./ContractCreateTripRequest";
import { ContractTrip } from "./ContractTrip";
import { ContractCreateCarRequest } from "./ContractCreateCarRequest";
import { ContractSearchCarParams } from "./ContractSearchCarParams";
import { ContractChatInfo } from "./ContractChatInfo";
import { ContractUpdateCarInfoRequest } from "./ContractUpdateCarInfoRequest";
import { ContractCreateClaimRequest } from "./ContractCreateClaimRequest";
import { ContractFullClaimInfo } from "./ContractClaimInfo";

export interface IRentalityContract {
  /// ADMIN functions
  owner(): Promise<string>;
  getCarServiceAddress(): Promise<string>;
  updateCarService(contractAddress: string): Promise<ContractTransaction>;
  getCurrencyConverterServiceAddress(): Promise<string>;
  updateCurrencyConverterService(contractAddress: string): Promise<ContractTransaction>;
  getTripServiceAddress(): Promise<string>;
  updateTripService(contractAddress: string): Promise<ContractTransaction>;
  getUserServiceAddress(): Promise<string>;
  updateUserService(contractAddress: string): Promise<ContractTransaction>;
  getRentalityPlatformAddress(): Promise<string>;
  updateRentalityPlatform(contractAddress: string): Promise<ContractTransaction>;
  getPlatformFeeInPPM(): Promise<bigint>;

  /// HOST functions
  addCar(request: ContractCreateCarRequest): Promise<ContractTransaction>;
  updateCarInfo(request: ContractUpdateCarInfoRequest): Promise<ContractTransaction>;
  updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: string,
    geoApiKey: string
  ): Promise<ContractTransaction>;
  getCarMetadataURI(carId: bigint): Promise<string>;
  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;
  getMyCars(): Promise<ContractCarInfo[]>;
  getTripsAsHost(): Promise<ContractTrip[]>;
  approveTripRequest(tripId: bigint): Promise<ContractTransaction>;
  rejectTripRequest(tripId: bigint): Promise<ContractTransaction>;
  checkInByHost(tripId: bigint, panelParams: bigint[]): Promise<ContractTransaction>;
  checkOutByHost(tripId: bigint, panelParams: bigint[]): Promise<ContractTransaction>;
  finishTrip(tripId: bigint): Promise<ContractTransaction>;
  getChatInfoForHost(): Promise<ContractChatInfo[]>;
  createClaim(request: ContractCreateClaimRequest): Promise<ContractTransaction>;
  rejectClaim(claimId: bigint): Promise<ContractTransaction>;
  getMyClaimsAsHost(): Promise<ContractFullClaimInfo[]>;

  /// GUEST functions
  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractAvailableCarInfo[]>;
  createTripRequest(request: ContractCreateTripRequest, value: object): Promise<ContractTransaction>;
  getTripsAsGuest(): Promise<ContractTrip[]>;
  checkInByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransaction>;
  checkOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransaction>;
  getChatInfoForGuest(): Promise<ContractChatInfo[]>;
  payClaim(claimId: bigint, value: object): Promise<ContractTransaction>;
  getMyClaimsAsGuest(): Promise<ContractFullClaimInfo[]>;

  /// GENERAL functions
  address: string;
  //getAddress(): Promise<string>;
  getCarMetadataURI(carId: bigint): Promise<string>;
  getTrip(tripId: bigint): Promise<ContractTrip>;
  getTripContactInfo(tripId: bigint): Promise<ContractTripContactInfo>;
  getMyKYCInfo(): Promise<ContractKYCInfo>;
  setKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint
  ): Promise<ContractTransaction>;

  //not using
  burnCar(carId: bigint): Promise<ContractCarInfo>;
  updateCarTokenUri(carId: bigint, tokenUri: string): Promise<ContractTransaction>;
  getAvailableCars(): Promise<ContractCarInfo[]>;
  getAllCars(): Promise<ContractCarInfo[]>;
  getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]>;
  searchAvailableCarsForUser(
    user: string,
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractAvailableCarInfo[]>;
  getTripsByGuest(guest: string): Promise<ContractTrip[]>;
  getTripsByHost(host: string): Promise<ContractTrip[]>;
  getTripsByCar(carId: bigint): Promise<ContractTrip[]>;
  updateClaim(claimId: bigint): Promise<ContractTransaction>;
  getClaim(claimId: bigint): Promise<ContractFullClaimInfo[]>;
  getClaimsByTrip(tripId: bigint): Promise<ContractFullClaimInfo[]>;
  getKYCInfo(user: string): Promise<ContractKYCInfo>;
  getCarsRentedByMe(): Promise<ContractCarInfo[]>;
}

export interface IRentalityAdminGateway {
  withdrawFromPlatform(amount: bigint): Promise<ContractTransaction>;
  withdrawAllFromPlatform(): Promise<ContractTransaction>;
  setPlatformFeeInPPM(valueInPPM: bigint): Promise<ContractTransaction>;
}

export interface IRentalityChatHelperContract {
  setMyChatPublicKey(chatPrivateKey: string, chatPublicKey: string): Promise<ContractTransaction>;
  getMyChatKeys(): Promise<string[]>;
  getChatPublicKeys(addresses: string[]): Promise<ContractAddressPublicKey[]>;
}

export type ContractKYCInfo = {
  name: string;
  surname: string;
  mobilePhoneNumber: string;
  profilePhoto: string;
  licenseNumber: string;
  expirationDate: bigint;
};

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
