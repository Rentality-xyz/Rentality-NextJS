import { ContractTransaction } from "ethers";
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
  ): Promise<ContractTransaction>;
  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;
  getMyCars(): Promise<ContractCarInfo[]>;
  getTripsAsHost(): Promise<ContractTrip[]>;
  approveTripRequest(tripId: bigint): Promise<ContractTransaction>;
  rejectTripRequest(tripId: bigint): Promise<ContractTransaction>;
  checkInByHost(tripId: bigint, startFuelLevelInPermille: bigint, startOdometr: bigint): Promise<ContractTransaction>;
  checkOutByHost(tripId: bigint, endFuelLevelInPermille: bigint, endOdometr: bigint): Promise<ContractTransaction>;
  finishTrip(tripId: bigint): Promise<ContractTransaction>;
  getChatInfoForHost(): Promise<ContractChatInfo[]>;

  /// GUEST functions
  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractCarInfo[]>;
  createTripRequest(request: ContractCreateTripRequest, value: object): Promise<ContractTransaction>;
  getTripsAsGuest(): Promise<ContractTrip[]>;
  getCarsRentedByMe(): Promise<ContractCarInfo[]>;
  checkInByGuest(tripId: bigint, startFuelLevelInPermille: bigint, startOdometr: bigint): Promise<ContractTransaction>;
  checkOutByGuest(tripId: bigint, endFuelLevelInPermille: bigint, endOdometr: bigint): Promise<ContractTransaction>;
  getChatInfoForGuest(): Promise<ContractChatInfo[]>;

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
