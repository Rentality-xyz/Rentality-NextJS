import { ContractTransaction } from "ethers";
import { ContractAvailableCarInfo, ContractCarInfo } from "./ContractCarInfo";
import { ContractCreateTripRequest } from "./ContractCreateTripRequest";
import { ContractTrip } from "./ContractTrip";
import { ContractCreateCarRequest } from "./ContractCreateCarRequest";
import { ContractSearchCarParams } from "./ContractSearchCarParams";
import { ContractChatInfo } from "./ContractChatInfo";
import { ContractUpdateCarInfoRequest } from "./ContractUpdateCarInfoRequest";
import { ContractCreateClaimRequest } from "./ContractCreateClaimRequest";
import { ContractFullClaimInfo } from "./ContractFullClaimInfo";

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
  withdrawFromPlatform(amount: bigint): Promise<ContractTransaction>;
  withdrawAllFromPlatform(): Promise<ContractTransaction>;
  getPlatformFeeInPPM(): Promise<bigint>;
  setPlatformFeeInPPM(valueInPPM: bigint): Promise<ContractTransaction>;

  /// HOST functions
  addCar(request: ContractCreateCarRequest): Promise<ContractTransaction>;
  updateCarInfo(request: ContractUpdateCarInfoRequest): Promise<ContractTransaction>;
  updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: string,
    geoApiKey: string
  ): Promise<ContractTransaction>;

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
  getCarsRentedByMe(): Promise<ContractCarInfo[]>;
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
  getTripContactInfo(tripId: bigint): Promise<TripContactInfo>;
  getMyKYCInfo(): Promise<KYCInfo>;
  setKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint
  ): Promise<ContractTransaction>;
}

type TripContactInfo = {
  guestPhoneNumber: string;
  hostPhoneNumber: string;
};
export type KYCInfo = {
  name: string;
  surname: string;
  mobilePhoneNumber: string;
  profilePhoto: string;
  licenseNumber: string;
  expirationDate: bigint;
};
