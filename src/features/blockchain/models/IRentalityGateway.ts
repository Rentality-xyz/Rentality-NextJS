import {
  ContractAvailableCarDTO,
  ContractBaseDiscount,
  ContractCalculatePaymentsDTO,
  ContractCarDetails,
  ContractCarInfoDTO,
  ContractCarInfoWithInsurance,
  ContractChatInfo,
  ContractCivicKYCInfo,
  ContractCreateCarRequest,
  ContractCreateClaimRequest,
  ContractCreateTripRequestWithDelivery,
  ContractDeliveryData,
  ContractDeliveryPrices,
  ContractFilterInfoDTO,
  ContractFullClaimInfo,
  ContractInsuranceDTO,
  ContractInsuranceInfo,
  ContractLocationInfo,
  ContractPublicHostCarDTO,
  ContractSaveInsuranceRequest,
  ContractSearchCarParams,
  ContractSearchCarWithDistance,
  ContractSignedLocationInfo,
  ContractTripDTO,
  ContractUpdateCarInfoRequest,
  ContractCheckPromoDTO,
  ContractFullKYCInfoDTO,
  ContractAiDamageAnalyzeCaseDataDTO,
} from "@/model/blockchain/schemas";
import { ContractTransactionResponse } from "ethers";
import { IEthersContract } from "./IEtherContract";
import { ContractResultWrapper } from "../types";

export interface IRentalityGateway extends ContractResultWrapper<IRentalityGatewayContract> {}

export interface IRentalityGatewayContract extends IEthersContract {
  /// USER PROFILE functions
  getMyFullKYCInfo(): Promise<ContractFullKYCInfoDTO>;
  setKYCInfo(
    nickName: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    email: string,
    TCSignature: string,
    hash: string
  ): Promise<ContractTransactionResponse>;
  setCivicKYCInfo(user: string, civicKycInfo: ContractCivicKYCInfo): Promise<ContractTransactionResponse>;
  setMyCivicKYCInfo(civicKycInfo: ContractCivicKYCInfo): Promise<ContractTransactionResponse>;
  getKycCommission(): Promise<bigint>;
  calculateKycCommission(currency: string): Promise<bigint>;
  payKycCommission(currency: string, value: object): Promise<ContractTransactionResponse>;
  isKycCommissionPaid(user: string): Promise<boolean>;
  useKycCommission(user: string): Promise<ContractTransactionResponse>;

  /// HOST CARS functions
  addCar(request: ContractCreateCarRequest): Promise<ContractTransactionResponse>;
  updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: ContractSignedLocationInfo
  ): Promise<ContractTransactionResponse>;
  getMyCars(): Promise<ContractCarInfoDTO[]>;
  getCarsOfHost(host: string): Promise<ContractPublicHostCarDTO[]>;
  getCarInfoById(carId: bigint): Promise<ContractCarInfoWithInsurance>;
  getCarDetails(carId: bigint): Promise<ContractCarDetails>;

  getDiscount(user: string): Promise<ContractBaseDiscount>;
  addUserDiscount(discounts: ContractBaseDiscount): Promise<ContractTransactionResponse>;
  addUserDeliveryPrices(
    underTwentyFiveMilesInUsdCents: bigint,
    aboveTwentyFiveMilesInUsdCents: bigint
  ): Promise<ContractTransactionResponse>;
  getUserDeliveryPrices(user: string): Promise<ContractDeliveryPrices>;
  getDeliveryData(carId: bigint): Promise<ContractDeliveryData>;

  /// TRIPS functions
  /// GENERAL
  getTripsAs(host: boolean): Promise<ContractTripDTO[]>;
  getTrip(tripId: bigint): Promise<ContractTripDTO>;

  ///   HOST
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

  /// GUEST functions
  getFilterInfo(duration: bigint): Promise<ContractFilterInfoDTO>;
  searchAvailableCarsWithDelivery(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUpInfo: ContractLocationInfo,
    returnInfo: ContractLocationInfo
  ): Promise<ContractSearchCarWithDistance[]>;
  checkCarAvailabilityWithDelivery(
    carId: bigint,
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUpInfo: ContractLocationInfo,
    returnInfo: ContractLocationInfo
  ): Promise<ContractAvailableCarDTO>;
  calculatePaymentsWithDelivery(
    carId: bigint,
    daysOfTrip: bigint,
    currency: string,
    pickUpLocation: ContractLocationInfo,
    returnLocation: ContractLocationInfo,
    promoCode: string
  ): Promise<ContractCalculatePaymentsDTO>;
  createTripRequestWithDelivery(
    request: ContractCreateTripRequestWithDelivery,
    promoCode: string,
    value: object
  ): Promise<ContractTransactionResponse>;
  checkInByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  checkOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse>;
  confirmCheckOut(tripId: bigint): Promise<ContractTransactionResponse>;

  // CLAIMS functions
  getMyClaimsAs(host: boolean): Promise<ContractFullClaimInfo[]>;
  getClaim(claimId: bigint): Promise<ContractFullClaimInfo>;
  createClaim(request: ContractCreateClaimRequest): Promise<ContractTransactionResponse>;
  calculateClaimValue(claimId: bigint): Promise<bigint>;
  payClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;
  rejectClaim(claimId: bigint): Promise<ContractTransactionResponse>;

  // CHAT functions
  getChatInfoFor(host: boolean): Promise<ContractChatInfo[]>;

  //INSURANCE functions
  getInsurancesBy(host: boolean): Promise<ContractInsuranceDTO[]>;
  getMyInsurancesAsGuest(): Promise<ContractInsuranceInfo[]>;
  saveTripInsuranceInfo(
    tripId: bigint,
    insuranceInfo: ContractSaveInsuranceRequest
  ): Promise<ContractTransactionResponse>;
  saveGuestInsurance(insuranceInfo: ContractSaveInsuranceRequest): Promise<ContractTransactionResponse>;

  //PROMO functions
  checkPromo(code: string, startDateTime: bigint, endDateTime: bigint): Promise<ContractCheckPromoDTO>;

  // DIMO functions
  saveDimoTokenIds(dimoTokenIds: bigint[], rentalityCarIds: bigint[]): Promise<ContractTransactionResponse>;

  /// GENERAL functions
  address: string;

  // temporary is not working (reversed)
  // isCarDetailsConfirmed(carId: bigint): Promise<boolean>;
  // confirmCarDetails(carId: bigint): Promise<ContractTransactionResponse>;

  // dimo
  // DIMO functions
  saveDimoTokenIds(dimoTokenIds: bigint[], rentalityCarIds: bigint[]): Promise<ContractTransactionResponse>;

  // AiDamageAnalyzee 
  getAiDamageAnalyzeCaseData(tripId: bigint): Promise<ContractAiDamageAnalyzeCaseDataDTO>;
  //not using
  // owner(): Promise<string>;
  // updateServiceAddresses(): Promise<ContractTransactionResponse>;
  // getAllCars(): Promise<ContractCarInfo[]>;
  // getTripReceipt(tripId: bigint): Promise<ContractTripReceiptDTO>;
  // getAvailableCars(): Promise<ContractCarInfo[]>;
  // getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]>;
  //updateCarTokenUri(carId: bigint, tokenUri: string): Promise<ContractTransactionResponse>;
  // getCarMetadataURI(carId: bigint): Promise<string>;
}
