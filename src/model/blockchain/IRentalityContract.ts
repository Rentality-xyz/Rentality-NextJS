import { Transaction } from "ethers";
import { ContractCarInfo } from "./ContractCarInfo";
import { ContractCreateTripRequest } from "./ContractCreateTripRequest";
import { ContractTrip } from "./ContractTrip";

export interface IRentalityContract {
  owner(): Promise<string>;
  getCarServiceAddress(): Promise<string>;
  updateCarService(contractAddress: string): Promise<Transaction>;
  getCurrencyConverterServiceAddress(): Promise<string>;
  updateCurrencyConverterService(contractAddress: string): Promise<Transaction>;
  getTripServiceAddress(): Promise<string>;
  updateTripService(contractAddress: string): Promise<Transaction>;
  getUserServiceAddress(): Promise<string>;
  updateUserService(contractAddress: string): Promise<Transaction>;
  withdrawFromPlatform(amount: bigint): Promise<Transaction>;
  withdrawAllFromPlatform(): Promise<Transaction>;
  getPlatformFeeInPPM(): Promise<number>;
  setPlatformFeeInPPM(valueInPPM:number): Promise<Transaction>;

  ///host functions
  addCar(
    tokenUri: string,
    carVinNumber: string,
    pricePerDayInUsdCents: bigint,
    tankVolumeInGal: bigint,
    distanceIncludedInMi: bigint
  ): Promise<Transaction>;
  getCarMetadataURI(carId: bigint): Promise<string>;
  getMyCars(): Promise<ContractCarInfo[]>;
  getTripsAsHost(): Promise<ContractTrip[]>;
  approveTripRequest(tripId: bigint): Promise<Transaction>;
  rejectTripRequest(tripId: bigint): Promise<Transaction>;
  checkInByHost(tripId: bigint,startFuelLevel: bigint,startOdometr: bigint): Promise<Transaction>;
  checkOutByHost(tripId: bigint,endFuelLevel: bigint,endOdometr: bigint): Promise<Transaction>;
  finishTrip(tripId: bigint): Promise<Transaction>;
  resolveIssue(tripId: bigint, fuelPricePerGal: bigint): Promise<Transaction>;

  ///guest functions
  getAvailableCars(): ContractCarInfo[];
  createTripRequest(request: ContractCreateTripRequest): Promise<Transaction>;
  getTripsAsGuest(): Promise<ContractTrip[]>;
  getCarsRentedByMe(): Promise<ContractCarInfo[]>;
  checkInByGuest(tripId: bigint,startFuelLevel: bigint,startOdometr: bigint): Promise<Transaction>;
  checkOutByGuest(tripId: bigint,endFuelLevel: bigint,endOdometr: bigint): Promise<Transaction>;
};
