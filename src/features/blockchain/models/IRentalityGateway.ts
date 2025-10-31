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
  ContractCurrency,
  CaseType,
  ContractAiDamageAnalyzeCaseRequestDTO,
  ContractSearchCarsWithDistanceDTO,
  ContractClaimV2,
  ContractHostInsuranceRule,
  ContractAllowedCurrencyDTO,
} from "@/model/blockchain/schemas";
import { ContractTransactionResponse } from "ethers";
import { IEthersContract } from "./IEtherContract";
import { ContractResultWrapper } from "../types";

export interface IRentalityGateway extends ContractResultWrapper<IRentalityGatewayContract> {}

export interface IRentalityGatewayContract extends IEthersContract {
  /// USER PROFILE functions
  getMyFullKYCInfo(options?: object): Promise<ContractFullKYCInfoDTO>;
  setKYCInfo(
    nickName: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    email: string,
    TCSignature: string,
    hash: string
  ): Promise<ContractTransactionResponse>;
  setPushToken(user: string, pushToken: string): Promise<ContractTransactionResponse>;
  setCivicKYCInfo(user: string, civicKycInfo: ContractCivicKYCInfo): Promise<ContractTransactionResponse>;
  setMyCivicKYCInfo(civicKycInfo: ContractCivicKYCInfo): Promise<ContractTransactionResponse>;
  getKycCommission(): Promise<bigint>;
  calculateKycCommission(currency: string): Promise<bigint>;
  payKycCommission(currency: string, value: object): Promise<ContractTransactionResponse>;
  isKycCommissionPaid(user: string): Promise<boolean>;
  useKycCommission(user: string): Promise<ContractTransactionResponse>;
  setPhoneNumber(user: string, phone: string, isVerified: boolean): Promise<ContractTransactionResponse>;
  setEmail(user: string, email: string, isVerified: boolean): Promise<ContractTransactionResponse>;

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
  getUserCurrency(user: string): Promise<ContractCurrency>;

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
  addUserCurrency(currency: string): Promise<ContractTransactionResponse>;
  /// GUEST functions
  getFilterInfo(duration: bigint): Promise<ContractFilterInfoDTO>;
  searchAvailableCarsWithDelivery(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUpInfo: ContractLocationInfo,
    returnInfo: ContractLocationInfo,
    from: bigint,
    to: bigint
  ): Promise<ContractSearchCarsWithDistanceDTO>;
  checkCarAvailabilityWithDelivery(
    carId: bigint,
    startDateTime: bigint,
    endDateTime: bigint,
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
  createClaim(request: ContractCreateClaimRequest, isHostInsurance: boolean): Promise<ContractTransactionResponse>;
  calculateClaimValue(claimId: bigint): Promise<bigint>;
  payClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;
  rejectClaim(claimId: bigint): Promise<ContractTransactionResponse>;
  getHostInsuranceClaims(): Promise<ContractFullClaimInfo[]>;
  setHostInsurance(insuranceId: bigint): Promise<ContractTransactionResponse>;
  getHostInsuranceRule(host: string): Promise<ContractHostInsuranceRule>;
  getHostInsuranceBalance(): Promise<Number>;
  getAllInsuranceRules(): Promise<ContractHostInsuranceRule[]>;
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

  // OTHERS
  getAvaibleCurrencies(): Promise<ContractCurrency[]>;
  getUniqCarsBrand(): Promise<string[]>;
  getUniqModelsByBrand(brand: string): Promise<string[]>;
  getTotalCarsAmount(): Promise<bigint>;
  getAvailableCurrency(): Promise<ContractAllowedCurrencyDTO[]>;
  /// GENERAL functions
  address: string;

  // DIMO functions
  saveDimoTokenIds(dimoTokenIds: bigint[], rentalityCarIds: bigint[]): Promise<ContractTransactionResponse>;

  // AiDamageAnalyzee
  getAiDamageAnalyzeCaseRequest(tripId: bigint, caseType: CaseType): Promise<ContractAiDamageAnalyzeCaseRequestDTO>;

  // temporary is not working (reversed)
  // isCarDetailsConfirmed(carId: bigint): Promise<boolean>;
  // confirmCarDetails(carId: bigint): Promise<ContractTransactionResponse>;

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
