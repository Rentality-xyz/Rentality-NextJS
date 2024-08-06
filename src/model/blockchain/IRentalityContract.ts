import { ContractTransactionResponse } from "ethers";
import {
  CarInvestment,
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
  InvestmentDTO,
} from "./schemas";

export interface IRentalityContract {
  /// HOST functions
  addCar(request: ContractCreateCarRequest): Promise<ContractTransactionResponse>;

  updateCarInfo(request: ContractUpdateCarInfoRequest): Promise<ContractTransactionResponse>;

  updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: ContractSignedLocationInfo,
    geoApiKey: string
  ): Promise<ContractTransactionResponse>;

  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;

  getMyCars(): Promise<ContractCarInfoDTO[]>;

  getTripsAsHost(): Promise<ContractTripDTO[]>;

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

  getChatInfoForHost(): Promise<ContractChatInfo[]>;

  createClaim(request: ContractCreateClaimRequest): Promise<ContractTransactionResponse>;

  rejectClaim(claimId: bigint): Promise<ContractTransactionResponse>;

  getMyClaimsAsHost(): Promise<ContractFullClaimInfo[]>;

  getDiscount(user: string): Promise<ContractBaseDiscount>;

  addUserDiscount(discounts: ContractBaseDiscount): Promise<ContractTransactionResponse>;

  /// GUEST functions
  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractSearchCarWithDistance[]>;

  searchAvailableCarsWithDelivery(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUpInfo: ContractLocationInfo,
    returnInfo: ContractLocationInfo
  ): Promise<ContractSearchCarWithDistance[]>;

  createTripRequest(request: ContractCreateTripRequest, value: object): Promise<ContractTransactionResponse>;

  getTripsAsGuest(): Promise<ContractTripDTO[]>;

  checkInByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;

  checkOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;

  getChatInfoForGuest(): Promise<ContractChatInfo[]>;

  payClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;

  getMyClaimsAsGuest(): Promise<ContractFullClaimInfo[]>;

  calculatePayments(carId: bigint, daysOfTrip: bigint, currency: string): Promise<ContractCalculatePaymentsDTO>;

  confirmCheckOut(tripId: bigint): Promise<ContractTransactionResponse>;

  /// GENERAL functions
  address: string;

  owner(): Promise<string>;

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

  createTripRequestWithDelivery(
    request: ContractCreateTripRequestWithDelivery,
    value: object
  ): Promise<ContractTransactionResponse>;

  getDeliveryData(carId: bigint): Promise<ContractDeliveryData>;

  addUserDeliveryPrices(
    underTwentyFiveMilesInUsdCents: bigint,
    aboveTwentyFiveMilesInUsdCents: bigint
  ): Promise<ContractTransactionResponse>;

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

  payKycCommission(currency: string, value: object): Promise<ContractTransactionResponse>;

  isKycCommissionPaid(user: string): Promise<boolean>;

  useKycCommission(user: string): Promise<ContractTransactionResponse>;

  // temporary is not working (reversed)
  isCarDetailsConfirmed(carId: bigint): Promise<boolean>;

  confirmCarDetails(carId: bigint): Promise<ContractTransactionResponse>;

  //not using
  getAllCars(): Promise<ContractCarInfo[]>;

  updateServiceAddresses(): Promise<ContractTransactionResponse>;

  getTripReceipt(tripId: bigint): Promise<ContractTripReceiptDTO>;

  getAvailableCars(): Promise<ContractCarInfo[]>;

  getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]>;

  parseGeoResponse(carId: bigint): Promise<ContractTransactionResponse>;

  createCarInvestment(
    car: {
      inProgress: boolean;
      car: ContractCreateCarRequest;
      priceInUsd: bigint;
      creatorPercents: bigint;
    },
    name_: string,
    symbol_: string
  ): Promise<ContractTransactionResponse>;

  invest(investId: number, value: object): Promise<void>;

  claimAllMy(investId: number): Promise<void>;
}

export interface IRentalityInvestment {
  address: string;

  claimAndCreatePool(investId: number): Promise<void>;

  getAllInvestments(): Promise<InvestmentDTO[]>;
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

  getFromUsdLatest(currencyAddress: string, valueInUsdCents: bigint): Promise<bigint[]>;

  getUsdFromEthLatest(
    valueInEth: bigint
  ): Promise<{ valueInUsdCents: bigint; ethToUsdRate: bigint; ethToUsdDecimals: bigint }>;

  getEthFromUsd(valueInUsdCents: bigint, ethToUsdRate: bigint, ethToUsdDecimals: bigint): Promise<bigint>;

  getUsdFromEth(valueInEth: bigint, ethToUsdRate: bigint, ethToUsdDecimals: bigint): Promise<bigint>;

  getEthToUsdRateWithCache(): Promise<{ ethToUsdRate: bigint; ethToUsdDecimals: bigint }>;

  getFromUsdWithCache(tokenAddress: string, valueInUsdCents: bigint): Promise<bigint>;

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
