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

export interface IRentalitySender extends ContractResultWrapper<IRentalitySenderContract> {}

export interface IRentalitySenderContract extends IEthersContract {
    /// USER PROFILE functions
    setKYCInfo(
      nickName: string,
      mobilePhoneNumber: string,
      profilePhoto: string,
      email: string,
      TCSignature: string,
      hash: string,
      value: object
    ): Promise<ContractTransactionResponse>;
    quoteSetKYCInfo(
      nickName: string,
      mobilePhoneNumber: string,
      profilePhoto: string,
      email: string,
      TCSignature: string,
      hash: string
    ): Promise<bigint>;
  
    setPushToken(user: string, pushToken: string, value: object): Promise<ContractTransactionResponse>;
    quoteSetPushToken(user: string, pushToken: string): Promise<bigint>;
  
    setCivicKYCInfo(user: string, civicKycInfo: ContractCivicKYCInfo, value: object): Promise<ContractTransactionResponse>;
    quoteSetCivicKYCInfo(user: string, civicKycInfo: ContractCivicKYCInfo): Promise<bigint>;
  
    setMyCivicKYCInfo(civicKycInfo: ContractCivicKYCInfo, value: object): Promise<ContractTransactionResponse>;
    quoteSetMyCivicKYCInfo(civicKycInfo: ContractCivicKYCInfo): Promise<bigint>;
  
    payKycCommission(currency: string, value: object): Promise<ContractTransactionResponse>;
    quotePayKycCommission(value: bigint, currency: string): Promise<bigint>;
  
    useKycCommission(user: string, value: object): Promise<ContractTransactionResponse>;
    quoteUseKycCommission(user: string): Promise<bigint>;
  
    setPhoneNumber(user: string, phone: string, isVerified: boolean, value: object): Promise<ContractTransactionResponse>;
    quoteSetPhoneNumber(user: string, phone: string, isVerified: boolean): Promise<bigint>;
  
    setEmail(user: string, email: string, isVerified: boolean, value: object): Promise<ContractTransactionResponse>;
    quoteSetEmail(user: string, email: string, isVerified: boolean): Promise<bigint>;
  
    /// HOST CARS functions
    addCar(request: ContractCreateCarRequest, value: object): Promise<ContractTransactionResponse>;
    quoteAddCar(request: ContractCreateCarRequest): Promise<bigint>;
  
    updateCarInfoWithLocation(
      request: ContractUpdateCarInfoRequest,
      location: ContractSignedLocationInfo,
      value: object
    ): Promise<ContractTransactionResponse>;
    quoteUpdateCarInfoWithLocation(
      request: ContractUpdateCarInfoRequest,
      location: ContractSignedLocationInfo
    ): Promise<bigint>;
  
    addUserDiscount(discounts: ContractBaseDiscount, value: object): Promise<ContractTransactionResponse>;
    quoteAddUserDiscount(discounts: ContractBaseDiscount): Promise<bigint>;
  
    addUserDeliveryPrices(
      underTwentyFiveMilesInUsdCents: bigint,
      aboveTwentyFiveMilesInUsdCents: bigint,
      value: object
    ): Promise<ContractTransactionResponse>;
    quoteAddUserDeliveryPrices(
      underTwentyFiveMilesInUsdCents: bigint,
      aboveTwentyFiveMilesInUsdCents: bigint
    ): Promise<bigint>;
  
    /// TRIPS functions
    /// HOST
    approveTripRequest(tripId: bigint, value: object): Promise<ContractTransactionResponse>;
    quoteApproveTripRequest(tripId: bigint): Promise<bigint>;
  
    rejectTripRequest(tripId: bigint, value: object): Promise<ContractTransactionResponse>;
    quoteRejectTripRequest(tripId: bigint): Promise<bigint>;
  
    checkInByHost(
      tripId: bigint,
      panelParams: bigint[],
      insuranceCompany: string,
      insuranceNumber: string,
      value: object
    ): Promise<ContractTransactionResponse>;
    quoteCheckInByHost(
      tripId: bigint,
      panelParams: bigint[],
      insuranceCompany: string,
      insuranceNumber: string
    ): Promise<bigint>;
  
    checkOutByHost(tripId: bigint, panelParams: bigint[], value: object): Promise<ContractTransactionResponse>;
    quoteCheckOutByHost(tripId: bigint, panelParams: bigint[]): Promise<bigint>;
  
    finishTrip(tripId: bigint, value: object): Promise<ContractTransactionResponse>;
    quoteFinishTrip(tripId: bigint): Promise<bigint>;
  
    addUserCurrency(currency: string, value: object): Promise<ContractTransactionResponse>;
    quoteAddUserCurrency(currency: string): Promise<bigint>;
  
    /// GUEST functions
    createTripRequestWithDelivery(
        valueAmount: bigint,
        encodedFunctionDataWithSelector: string,
        value: object
    ): Promise<ContractTransactionResponse>;
    quoteCreateTripRequestWithDelivery(
      value: bigint,
      request: ContractCreateTripRequestWithDelivery,
      promoCode: string
    ): Promise<bigint>;
  
    checkInByGuest(tripId: bigint, panelParams: bigint[], value: object): Promise<ContractTransactionResponse>;
    quoteCheckInByGuest(tripId: bigint, panelParams: bigint[]): Promise<bigint>;
  
    checkOutByGuest(tripId: bigint, panelParams: bigint[], value: object): Promise<ContractTransactionResponse>;
    quoteCheckOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<bigint>;
  
    confirmCheckOut(tripId: bigint, value: object): Promise<ContractTransactionResponse>;
    quoteConfirmCheckOut(tripId: bigint): Promise<bigint>;
  
    // CLAIMS functions
    createClaim(request: ContractCreateClaimRequest, isHostInsurance: boolean, value: object): Promise<ContractTransactionResponse>;
    quoteCreateClaim(request: ContractCreateClaimRequest, isHostInsurance: boolean): Promise<bigint>;
  
    payClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;
    quotePayClaim(value: bigint, claimId: bigint): Promise<bigint>;
  
    rejectClaim(claimId: bigint, value: object): Promise<ContractTransactionResponse>;
    quoteRejectClaim(claimId: bigint): Promise<bigint>;
  
    setHostInsurance(insuranceId: bigint, value: object): Promise<ContractTransactionResponse>;
    quoteSetHostInsurance(insuranceId: bigint): Promise<bigint>;
  
    //INSURANCE functions
    saveTripInsuranceInfo(
      tripId: bigint,
      insuranceInfo: ContractSaveInsuranceRequest,
      value: object
    ): Promise<ContractTransactionResponse>;
    quoteSaveTripInsuranceInfo(
      tripId: bigint,
      insuranceInfo: ContractSaveInsuranceRequest
    ): Promise<bigint>;
  
    saveGuestInsurance(insuranceInfo: ContractSaveInsuranceRequest, value: object): Promise<ContractTransactionResponse>;
    quoteSaveGuestInsurance(insuranceInfo: ContractSaveInsuranceRequest): Promise<bigint>;
  
    // DIMO functions
    saveDimoTokenIds(dimoTokenIds: bigint[], rentalityCarIds: bigint[], value: object): Promise<ContractTransactionResponse>;
    quoteSaveDimoTokenIds(dimoTokenIds: bigint[], rentalityCarIds: bigint[]): Promise<bigint>;
  
    /// GENERAL functions
    address: string;
  }