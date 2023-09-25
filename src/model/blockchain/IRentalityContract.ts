import { ContractTransactionResponse } from "ethers";
import { ContractCarInfo } from "./ContractCarInfo";
import { ContractCreateTripRequest } from "./ContractCreateTripRequest";
import { ContractTrip } from "./ContractTrip";
import { ContractCreateCarRequest } from "./ContractCreateCarRequest";
import { ContractSearchCarParams } from "./ContractSearchCarParams";
import { ContractChatInfo } from "./ContractChatInfo";

export interface IRentalityContract {

  /// ADMIN functions
  owner(): Promise<string>;
  getCarServiceAddress(): Promise<string>;
  updateCarService(
    contractAddress: string
  ): Promise<ContractTransactionResponse>;
  getCurrencyConverterServiceAddress(): Promise<string>;
  updateCurrencyConverterService(
    contractAddress: string
  ): Promise<ContractTransactionResponse>;
  getTripServiceAddress(): Promise<string>;
  updateTripService(
    contractAddress: string
  ): Promise<ContractTransactionResponse>;
  getUserServiceAddress(): Promise<string>;
  updateUserService(
    contractAddress: string
  ): Promise<ContractTransactionResponse>;
  getRentalityPlatformAddress(): Promise<string>;
  withdrawFromPlatform(amount: bigint): Promise<ContractTransactionResponse>;
  withdrawAllFromPlatform(): Promise<ContractTransactionResponse>;
  getPlatformFeeInPPM(): Promise<bigint>;
  setPlatformFeeInPPM(valueInPPM: bigint): Promise<ContractTransactionResponse>;

  /// HOST functions
  addCar(
    request: ContractCreateCarRequest
  ): Promise<ContractTransactionResponse>;
  updateCarInfo(
    carId: bigint,
    pricePerDayInUsdCents: bigint,
    securityDepositPerTripInUsdCents: bigint,
    fuelPricePerGalInUsdCents: bigint,
    milesIncludedPerDay: bigint,
    country: string,
    state: string,
    city: string,
    locationLatitudeInPPM: bigint,
    locationLongitudeInPPM: bigint,
    currentlyListed: boolean
  ): Promise<ContractTransactionResponse>;
  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;
  getMyCars(): Promise<ContractCarInfo[]>;
  getTripsAsHost(): Promise<ContractTrip[]>;
  approveTripRequest(tripId: bigint): Promise<ContractTransactionResponse>;
  rejectTripRequest(tripId: bigint): Promise<ContractTransactionResponse>;
  checkInByHost(
    tripId: bigint,
    startFuelLevelInPermille: bigint,
    startOdometr: bigint
  ): Promise<ContractTransactionResponse>;
  checkOutByHost(
    tripId: bigint,
    endFuelLevelInPermille: bigint,
    endOdometr: bigint
  ): Promise<ContractTransactionResponse>;
  finishTrip(tripId: bigint): Promise<ContractTransactionResponse>;
  getChatInfoForHost(): Promise<ContractChatInfo[]>;

  /// GUEST functions
  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractCarInfo[]>;
  createTripRequest(
    request: ContractCreateTripRequest,
    value: object
  ): Promise<ContractTransactionResponse>;
  getTripsAsGuest(): Promise<ContractTrip[]>;
  getCarsRentedByMe(): Promise<ContractCarInfo[]>;
  checkInByGuest(
    tripId: bigint,
    startFuelLevelInPermille: bigint,
    startOdometr: bigint
  ): Promise<ContractTransactionResponse>;
  checkOutByGuest(
    tripId: bigint,
    endFuelLevelInPermille: bigint,
    endOdometr: bigint
  ): Promise<ContractTransactionResponse>;
  getChatInfoForGuest(): Promise<ContractChatInfo[]>;

  /// GENERAL functions
  getAddress(): Promise<string>;
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
  ): Promise<ContractTransactionResponse>;
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
