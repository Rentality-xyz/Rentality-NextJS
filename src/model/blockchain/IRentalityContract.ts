import { Transaction  } from "ethers";
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
  ): Promise<Transaction>;
  getCurrencyConverterServiceAddress(): Promise<string>;
  updateCurrencyConverterService(
    contractAddress: string
  ): Promise<Transaction>;
  getTripServiceAddress(): Promise<string>;
  updateTripService(
    contractAddress: string
  ): Promise<Transaction>;
  getUserServiceAddress(): Promise<string>;
  updateUserService(
    contractAddress: string
  ): Promise<Transaction>;
  getRentalityPlatformAddress(): Promise<string>;
  withdrawFromPlatform(amount: bigint): Promise<Transaction>;
  withdrawAllFromPlatform(): Promise<Transaction>;
  getPlatformFeeInPPM(): Promise<bigint>;
  setPlatformFeeInPPM(valueInPPM: bigint): Promise<Transaction>;

  /// HOST functions
  addCar(
    request: ContractCreateCarRequest
  ): Promise<Transaction>;
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
  ): Promise<Transaction>;
  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;
  getMyCars(): Promise<ContractCarInfo[]>;
  getTripsAsHost(): Promise<ContractTrip[]>;
  approveTripRequest(tripId: bigint): Promise<Transaction>;
  rejectTripRequest(tripId: bigint): Promise<Transaction>;
  checkInByHost(
    tripId: bigint,
    startFuelLevelInPermille: bigint,
    startOdometr: bigint
  ): Promise<Transaction>;
  checkOutByHost(
    tripId: bigint,
    endFuelLevelInPermille: bigint,
    endOdometr: bigint
  ): Promise<Transaction>;
  finishTrip(tripId: bigint): Promise<Transaction>;
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
  ): Promise<Transaction>;
  getTripsAsGuest(): Promise<ContractTrip[]>;
  getCarsRentedByMe(): Promise<ContractCarInfo[]>;
  checkInByGuest(
    tripId: bigint,
    startFuelLevelInPermille: bigint,
    startOdometr: bigint
  ): Promise<Transaction>;
  checkOutByGuest(
    tripId: bigint,
    endFuelLevelInPermille: bigint,
    endOdometr: bigint
  ): Promise<Transaction>;
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
  ): Promise<Transaction>;
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
