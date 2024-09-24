import { ContractTransactionResponse } from "ethers";
import {
  ContractAllCarsDTO,
  ContractAllTripsDTO,
  ContractBaseDiscount,
  ContractCalculatePaymentsDTO,
  ContractCarDetails,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractChatInfo,
  ContractCivicKYCInfo,
  ContractCreateCarRequest,
  ContractCreateClaimRequest,
  ContractCreateTripRequest,
  ContractCreateTripRequestWithDelivery,
  ContractDeliveryData,
  ContractDeliveryPrices,
  ContractFullClaimInfo,
  ContractFullKYCInfoDTO,
  ContractKYCInfo,
  ContractLocationInfo,
  ContractPublicHostCarDTO,
  ContractSearchCarParams,
  ContractSearchCarWithDistance,
  ContractSignedLocationInfo,
  ContractTripDTO,
  ContractTripFilter,
  ContractTripReceiptDTO,
  ContractUpdateCarInfoRequest,
  Role,
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
  //getMyKYCInfo(): Promise<ContractKYCInfo>;
  getMyFullKYCInfo(): Promise<ContractFullKYCInfoDTO>;
  setKYCInfo(
    nickName: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    TCSignature: string
  ): Promise<ContractTransactionResponse>;
  getCarsOfHost(host: string): Promise<ContractPublicHostCarDTO[]>;
  getClaim(claimId: bigint): Promise<ContractFullClaimInfo>;
  setCivicKYCInfo(user: string, civicKycInfo: ContractCivicKYCInfo): Promise<ContractTransactionResponse>;

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
  setCivicData(_civicVerifier: string, _civicGatekeeperNetwork: bigint): Promise<ContractTransactionResponse>;
  setNewTCMessage(message: string): Promise<ContractTransactionResponse>;

  manageRole(role: Role, user: string, grant: boolean): Promise<ContractTransactionResponse>;
  getAllTrips(filter: ContractTripFilter, page: bigint, itemsPerPage: bigint): Promise<ContractAllTripsDTO>;
  getAllCars(page: bigint, itemsPerPage: bigint): Promise<ContractAllCarsDTO>;
  payToHost(tripId: bigint): Promise<ContractTransactionResponse>;
  refundToGuest(tripId: bigint): Promise<ContractTransactionResponse>;

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
