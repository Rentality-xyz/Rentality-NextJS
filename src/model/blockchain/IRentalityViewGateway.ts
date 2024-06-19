import { ContractTransactionResponse, ethers } from "ethers";
import {
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
} from "@/model/blockchain/schemas";
import {
  ContractTripContactInfo,
  IRentalityContract,
  IRentalityPlatform,
  IRentalitySender,
} from "@/model/blockchain/IRentalityContract";
import { LocationInfo } from "@/model/LocationInfo";
import { EthereumInfo } from "@/contexts/web3/ethereumContext";
import type { JsonRpcSigner } from "ethers/src.ts/providers/provider-jsonrpc";
import { info } from "autoprefixer";

export interface IRentalityViewContract {
  getCarServiceAddress(): Promise<string>;

  getCurrencyConverterServiceAddress(): Promise<string>;

  getTripServiceAddress(): Promise<string>;

  getUserServiceAddress(): Promise<string>;

  getRentalityPlatformAddress(): Promise<string>;

  getPlatformFeeInPPM(): Promise<bigint>;

  getCarInfoById(carId: bigint): Promise<ContractCarInfo>;

  getMyCars(): Promise<ContractCarInfoDTO[]>;

  getTripsAsHost(): Promise<ContractTripDTO[]>;

  getChatInfoForHost(): Promise<ContractChatInfo[]>;

  getMyClaimsAsHost(): Promise<ContractFullClaimInfo[]>;

  getDiscount(user: string): Promise<ContractBaseDiscount>;

  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams
  ): Promise<ContractSearchCar[]>;

  searchAvailableCarsWithDelivery(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUp: ContractLocationInfo,
    returnL: ContractLocationInfo
  ): Promise<ContractSearchCar[]>;

  getTripsAsGuest(): Promise<ContractTripDTO[]>;

  getChatInfoForGuest(): Promise<ContractChatInfo[]>;

  getMyClaimsAsGuest(): Promise<ContractFullClaimInfo[]>;

  calculatePayments(carId: bigint, daysOfTrip: bigint, currency: string): Promise<ContractCalculatePaymentsDTO>;

  sender: string;
  address: string;

  getCarMetadataURI(carId: bigint): Promise<string>;

  getCarDetails(carId: bigint): Promise<ContractCarDetails>;

  getTrip(tripId: bigint): Promise<ContractTripDTO>;

  getTripContactInfo(tripId: bigint): Promise<ContractTripContactInfo>;

  getMyKYCInfo(): Promise<ContractKYCInfo>;

  getCarsOfHost(host: string): Promise<ContractPublicHostCarDTO[]>;

  getClaim(claimId: bigint): Promise<ContractFullClaimInfo>;

  getDeliveryData(carId: bigint): Promise<ContractDeliveryData>;

  calculatePaymentsWithDelivery(
    carId: bigint,
    daysOfTrip: bigint,
    currency: string,
    pickUp: ContractLocationInfo,
    returnL: ContractLocationInfo
  ): Promise<ContractCalculatePaymentsDTO>;

  getUserDeliveryPrices(user: string): Promise<ContractDeliveryPrices>;

  //not using
  getAllCars(): Promise<ContractCarInfo[]>;

  getTripReceipt(tripId: bigint): Promise<ContractTripReceiptDTO>;

  getAvailableCars(): Promise<ContractCarInfo[]>;

  getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]>;
}

export default class RentalityL0Contract implements IRentalitySender, IRentalityContract {
  defaultContract: ethers.Contract;
  currantChainContract: IRentalityContract;
  ethereumInfo: EthereumInfo;
  sender: string;
  isDefaultNetwork: boolean;
  address: string;

  constructor(
    defaultContract: ethers.Contract,
    sender: string,
    contract: IRentalityContract,
    isDefault: boolean,
    contractAddress: string,
    info: EthereumInfo
  ) {
    this.sender = sender;
    this.defaultContract = defaultContract;
    this.currantChainContract = contract;
    this.isDefaultNetwork = isDefault;
    this.address = contractAddress;
    this.ethereumInfo = info;
  }

  calculatePaymentsWithDelivery(
    carId: bigint,
    daysOfTrip: bigint,
    currency: string,
    pickUp: ContractLocationInfo,
    returnL: ContractLocationInfo
  ): Promise<ContractCalculatePaymentsDTO> {
    return this.defaultContract.calculatePaymentsWithDelivery(carId, daysOfTrip, currency, pickUp, returnL, {
      from: this.sender,
    });
  }

  getAllCars(): Promise<ContractCarInfo[]> {
    return this.defaultContract.getAllCars({ from: this.sender });
  }

  getAvailableCars(): Promise<ContractCarInfo[]> {
    return this.defaultContract.getAvailableCars({ from: this.sender });
  }

  getAvailableCarsForUser(user: string): Promise<ContractCarInfo[]> {
    return this.defaultContract.getAvailableCarsForUser(user, { from: this.sender });
  }

  getCarDetails(carId: bigint): Promise<ContractCarDetails> {
    return this.defaultContract.getCarDetails(carId, { from: this.sender });
  }

  getCarInfoById(carId: bigint): Promise<ContractCarInfo> {
    return this.defaultContract.getCarInfoById(carId, { from: this.sender });
  }

  getCarMetadataURI(carId: bigint): Promise<string> {
    return this.defaultContract.getCarMetadataURI(carId, { from: this.sender });
  }

  getCarServiceAddress(): Promise<string> {
    return this.defaultContract.getCarServiceAddress({ from: this.sender });
  }

  getCarsOfHost(host: string): Promise<ContractPublicHostCarDTO[]> {
    return this.defaultContract.getCarsOfHost(host, { from: this.sender });
  }

  getChatInfoForGuest(): Promise<ContractChatInfo[]> {
    return this.defaultContract.getChatInfoForGuest({ from: this.sender });
  }

  getChatInfoForHost(): Promise<ContractChatInfo[]> {
    return this.defaultContract.getChatInfoForHost({ from: this.sender });
  }

  getClaim(claimId: bigint): Promise<ContractFullClaimInfo> {
    return this.defaultContract.getClaim(claimId, { from: this.sender });
  }

  getCurrencyConverterServiceAddress(): Promise<string> {
    return this.defaultContract.getCurrencyConverterServiceAddress({ from: this.sender });
  }

  getDeliveryData(carId: bigint): Promise<ContractDeliveryData> {
    return this.defaultContract.getDeliveryData(carId, { from: this.sender });
  }

  getDiscount(user: string): Promise<ContractBaseDiscount> {
    return this.defaultContract.getDiscount(user, { from: this.sender });
  }

  getMyCars(): Promise<ContractCarInfoDTO[]> {
    return this.defaultContract.getMyCars({ from: this.sender });
  }

  getMyClaimsAsGuest(): Promise<ContractFullClaimInfo[]> {
    return this.defaultContract.getMyClaimsAsGuest({ from: this.sender });
  }

  getMyClaimsAsHost(): Promise<ContractFullClaimInfo[]> {
    return this.defaultContract.getMyClaimsAsHost({ from: this.sender });
  }

  getMyKYCInfo(): Promise<ContractKYCInfo> {
    return this.defaultContract.getMyKYCInfo({ from: this.sender });
  }

  getPlatformFeeInPPM(): Promise<bigint> {
    return this.defaultContract.getPlatformFeeInPPM({ from: this.sender });
  }

  getRentalityPlatformAddress(): Promise<string> {
    return this.defaultContract.getRentalityPlatformAddress({ from: this.sender });
  }

  getTrip(tripId: bigint): Promise<ContractTripDTO> {
    return this.defaultContract.getTrip(tripId, { from: this.sender });
  }

  getTripContactInfo(tripId: bigint): Promise<ContractTripContactInfo> {
    return this.defaultContract.getTripContactInfo(tripId, { from: this.sender });
  }

  getTripReceipt(tripId: bigint): Promise<ContractTripReceiptDTO> {
    return this.defaultContract.getTripReceipt(tripId, { from: this.sender });
  }

  getTripServiceAddress(): Promise<string> {
    return this.defaultContract.getTripServiceAddress({ from: this.sender });
  }

  getTripsAsGuest(): Promise<ContractTripDTO[]> {
    return this.defaultContract.getTripsAsGuest({ from: this.sender });
  }

  getTripsAsHost(): Promise<ContractTripDTO[]> {
    return this.defaultContract.getTripsAsHost({ from: this.sender });
  }

  getUserDeliveryPrices(user: string): Promise<ContractDeliveryPrices> {
    return this.defaultContract.getUserDeliveryPrices(user, { from: this.sender });
  }

  getUserServiceAddress(): Promise<string> {
    return this.defaultContract.getUserServiceAddress({ from: this.sender });
  }

  searchAvailableCars(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    user = this.sender
  ): Promise<ContractSearchCarWithDistance[]> {
    return this.defaultContract.searchAvailableCars(startDateTime, endDateTime, searchParams, { from: user });
  }

  searchAvailableCarsWithDelivery(
    startDateTime: bigint,
    endDateTime: bigint,
    searchParams: ContractSearchCarParams,
    pickUp: ContractLocationInfo,
    returnL: ContractLocationInfo,
    user = this.sender
  ): Promise<ContractSearchCarWithDistance[]> {
    return this.defaultContract.searchAvailableCarsWithDelivery(
      startDateTime,
      endDateTime,
      searchParams,
      pickUp,
      returnL,
      { from: user }
    );
  }

  calculatePayments(carId: bigint, daysOfTrip: bigint, currency: string): Promise<ContractCalculatePaymentsDTO> {
    return this.defaultContract.calculatePayments(carId, daysOfTrip, currency, { from: this.sender });
  }

  async addCar(request: ContractCreateCarRequest, data?: { value: bigint }): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.addCar(request);
    }
    const validatorFee = await (this.currantChainContract as unknown as IRentalitySender).quoteAddCar(request);
    return this.currantChainContract.addCar(request, { value: validatorFee });
  }

  async addUserDeliveryPrices(
    underTwentyFiveMilesInUsdCents: bigint,
    aboveTwentyFiveMilesInUsdCents: bigint
  ): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.addUserDeliveryPrices(
        underTwentyFiveMilesInUsdCents,
        aboveTwentyFiveMilesInUsdCents
      );
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteAddUserDeliveryPrices(
      underTwentyFiveMilesInUsdCents,
      aboveTwentyFiveMilesInUsdCents
    );
    return this.currantChainContract.addUserDeliveryPrices(
      underTwentyFiveMilesInUsdCents,
      aboveTwentyFiveMilesInUsdCents,
      { value: quote }
    );
  }

  async addUserDiscount(discounts: ContractBaseDiscount): Promise<ContractTransactionResponse> {
    if (this.defaultContract) {
      return this.currantChainContract.addUserDiscount(discounts);
    } else {
      let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteAddUserDiscount(discounts);
      return this.currantChainContract.addUserDiscount(discounts, { value: quote });
    }
  }

  async approveTripRequest(tripId: bigint): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.approveTripRequest(tripId);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteApproveTripRequest(tripId);
    return this.currantChainContract.approveTripRequest(tripId, { value: quote });
  }

  async checkInByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.checkInByGuest(tripId, panelParams);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteCheckInByGuest(
      tripId,
      panelParams
    );
    return this.currantChainContract.checkInByGuest(tripId, panelParams, { value: quote });
  }

  async checkInByHost(
    tripId: bigint,
    panelParams: bigint[],
    insuranceCompany: string,
    insuranceNumber: string
  ): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.checkInByHost(tripId, panelParams, insuranceCompany, insuranceNumber);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteCheckInByHost(
      tripId,
      panelParams,
      insuranceCompany,
      insuranceNumber
    );
    return this.currantChainContract.checkInByHost(tripId, panelParams, insuranceCompany, insuranceNumber, {
      value: quote,
    });
  }

  async checkOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.checkOutByGuest(tripId, panelParams);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteCheckOutByGuest(
      tripId,
      panelParams
    );
    return this.currantChainContract.checkOutByGuest(tripId, panelParams, { value: quote });
  }

  async checkOutByHost(tripId: bigint, panelParams: bigint[]): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.checkOutByHost(tripId, panelParams);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteCheckOutByHost(
      tripId,
      panelParams
    );
    return this.currantChainContract.checkOutByHost(tripId, panelParams, { value: quote });
  }

  async confirmCheckOut(tripId: bigint): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.confirmCheckOut(tripId);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteConfirmCheckOut(tripId);
    return this.currantChainContract.confirmCheckOut(tripId, { value: quote });
  }

  async createClaim(request: ContractCreateClaimRequest): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.createClaim(request);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteCreateClaim(request);
    return this.currantChainContract.createClaim(request, { value: quote });
  }

  async createTripRequest(request: ContractCreateTripRequest, value: object): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      // @ts-ignore
      return this.currantChainContract.createTripRequest(value.value, request, value);
    }
    // @ts-ignore
    let _value = value.value;
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteCreateTripRequest(
      _value,
      request
    );
    return this.currantChainContract.createTripRequest(_value, request, { value: quote });
  }

  async createTripRequestWithDelivery(
    request: ContractCreateTripRequestWithDelivery,
    value: object
  ): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      // @ts-ignore
      return this.currantChainContract.createTripRequestWithDelivery(value.value, request, value);
    }
    // @ts-ignore
    let _value = value.value;
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteCreateTripRequestWithDelivery(
      _value,
      request
    );
    return this.currantChainContract.createTripRequestWithDelivery(_value, request, { value: quote });
  }

  async finishTrip(tripId: bigint): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.finishTrip(tripId);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteFinishTrip(tripId);
    return this.currantChainContract.finishTrip(tripId, { value: quote });
  }

  owner(): Promise<string> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).owner();
    }
    throw new Error("Wrong contract type");
  }

  async parseGeoResponse(carId: bigint): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.parseGeoResponse(carId);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteParseGeoResponse(carId);
    return this.currantChainContract.parseGeoResponse(carId, { value: quote });
  }

  async payClaim(_: bigint | 0, claimId: bigint, value: object): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      // @ts-ignore
      return this.currantChainContract.payClaim(value.value, claimId, value);
    }
    // @ts-ignore
    let _value = value.value;
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quotePayClaim(_value, claimId);
    return this.currantChainContract.payClaim(_value, claimId, { value: quote });
  }

  async rejectClaim(claimId: bigint): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.rejectClaim(claimId);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteRejectClaim(claimId);
    return this.currantChainContract.rejectClaim(claimId, { value: quote });
  }

  async rejectTripRequest(tripId: bigint): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.rejectTripRequest(tripId);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteRejectTripRequest(tripId);
    return this.currantChainContract.rejectTripRequest(tripId, { value: quote });
  }

  async setKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint,
    tcSignature: string
  ): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return this.currantChainContract.setKYCInfo(
        name,
        surname,
        mobilePhoneNumber,
        profilePhoto,
        licenseNumber,
        expirationDate,
        tcSignature
      );
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteSetKYCInfo(
      name,
      surname,
      mobilePhoneNumber,
      profilePhoto,
      licenseNumber,
      expirationDate,
      tcSignature
    );

    return this.currantChainContract.setKYCInfo(
      name,
      surname,
      mobilePhoneNumber,
      profilePhoto,
      licenseNumber,
      expirationDate,
      tcSignature,
      { value: quote }
    );
  }

  async updateCarInfo(request: ContractUpdateCarInfoRequest): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateCarInfo(request);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteUpdateCarInfo(request);
    return (this.currantChainContract as IRentalityContract).updateCarInfo(request, { value: quote });
  }

  async updateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: ContractSignedLocationInfo,
    apiKey: string
  ): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateCarInfoWithLocation(request, location, apiKey);
    }
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteUpdateCarInfoWithLocation(
      request,
      location,
      apiKey
    );
    return (this.currantChainContract as IRentalityContract).updateCarInfoWithLocation(request, location, apiKey, {
      value: quote,
    });
  }

  updateCarService(contractAddress: string): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateCarService(contractAddress);
    }
    throw new Error("Wrong contract type");
  }

  updateCurrencyConverterService(contractAddress: string): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateCurrencyConverterService(contractAddress);
    }
    throw new Error("Wrong contract type");
  }

  updateRentalityPlatform(contractAddress: string): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateRentalityPlatform(contractAddress);
    }
    throw new Error("Wrong contract type");
  }

  updateServiceAddresses(): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateServiceAddresses();
    }
    throw new Error("Wrong contract type");
  }

  updateTripService(contractAddress: string): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateTripService(contractAddress);
    }
    throw new Error("Wrong contract type");
  }

  updateUserService(contractAddress: string): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      return (this.currantChainContract as IRentalityContract).updateUserService(contractAddress);
    }
    throw new Error("Wrong contract type");
  }

  calculateKycCommission(currency: string): Promise<bigint> {
    return this.defaultContract.calculateKycCommission({ from: this.sender });
  }

  getKycCommission(): Promise<bigint> {
    return this.defaultContract.getKycCommission({ from: this.sender });
  }

  isKycCommissionPaid(user: string): Promise<boolean> {
    return this.defaultContract.isKycCommissionPaid(user, { from: this.sender });
  }

  async payKycCommission(amount: bigint, currency: string, _value: object): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      // @ts-ignore
      return this.currantChainContract.payKycCommission(_value.value, currency, { value: _value });
    }
    // @ts-ignore
    let value = _value.value;
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quotePayKycCommission(value, currency);
    return this.currantChainContract.payKycCommission(value, currency, { value: quote });
  }

  async useKycCommission(user: string): Promise<ContractTransactionResponse> {
    if (this.isDefaultNetwork) {
      // @ts-ignore
      return this.currantChainContract.useKycCommission(user);
    }
    // @ts-ignore
    let value = _value.value;
    let quote = await (this.currantChainContract as unknown as IRentalitySender).quoteUseKycCommission(user);
    return this.currantChainContract.useKycCommission(user, { value: quote });
  }

  quoteAddCar(request: ContractCreateCarRequest): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteAddCar(request);
    }
    throw new Error("Wrong contract type");
  }

  quoteAddUserDeliveryPrices(
    underTwentyFiveMilesInUsdCents: bigint,
    aboveTwentyFiveMilesInUsdCents: bigint
  ): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteAddUserDeliveryPrices(
        underTwentyFiveMilesInUsdCents,
        aboveTwentyFiveMilesInUsdCents
      );
    }
    throw new Error("Wrong contract type");
  }

  quoteAddUserDiscount(discounts: ContractBaseDiscount): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteAddUserDiscount(discounts);
    }
    throw new Error("Wrong contract type");
  }

  quoteApproveTripRequest(tripId: bigint): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteApproveTripRequest(tripId);
    }
    throw new Error("Wrong contract type");
  }

  quoteCheckInByGuest(tripId: bigint, panelParams: bigint[]): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteCheckInByGuest(tripId, panelParams);
    }
    throw new Error("Wrong contract type");
  }

  quoteCheckInByHost(
    tripId: bigint,
    panelParams: bigint[],
    insuranceCompany: string,
    insuranceNumber: string
  ): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteCheckInByHost(
        tripId,
        panelParams,
        insuranceCompany,
        insuranceNumber
      );
    }
    throw new Error("Wrong contract type");
  }

  quoteCheckOutByGuest(tripId: bigint, panelParams: bigint[]): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteCheckOutByGuest(tripId, panelParams);
    }
    throw new Error("Wrong contract type");
  }

  quoteCheckOutByHost(tripId: bigint, panelParams: bigint[]): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteCheckOutByHost(tripId, panelParams);
    }
    throw new Error("Wrong contract type");
  }

  quoteConfirmCheckOut(tripId: bigint): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteConfirmCheckOut(tripId);
    }
    throw new Error("Wrong contract type");
  }

  quoteCreateClaim(request: ContractCreateClaimRequest): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteCreateClaim(request);
    }
    throw new Error("Wrong contract type");
  }

  quoteCreateTripRequest(value: number, request: ContractCreateTripRequest): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteCreateTripRequest(value, request);
    }
    throw new Error("Wrong contract type");
  }

  quoteCreateTripRequestWithDelivery(value: number, request: ContractCreateTripRequestWithDelivery): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteCreateTripRequestWithDelivery(
        value,
        request
      );
    }
    throw new Error("Wrong contract type");
  }

  quoteFinishTrip(tripId: bigint): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteFinishTrip(tripId);
    }
    throw new Error("Wrong contract type");
  }

  quoteParseGeoResponse(carId: bigint): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteParseGeoResponse(carId);
    }
    throw new Error("Wrong contract type");
  }

  quotePayClaim(value: number, claimId: bigint): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quotePayClaim(value, claimId);
    }
    throw new Error("Wrong contract type");
  }

  quoteRejectClaim(claimId: bigint): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteRejectClaim(claimId);
    }
    throw new Error("Wrong contract type");
  }

  quoteRejectTripRequest(tripId: bigint): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteRejectTripRequest(tripId);
    }
    throw new Error("Wrong contract type");
  }

  quoteSetKYCInfo(
    name: string,
    surname: string,
    mobilePhoneNumber: string,
    profilePhoto: string,
    licenseNumber: string,
    expirationDate: bigint,
    tcSignature: string
  ): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteSetKYCInfo(
        name,
        surname,
        mobilePhoneNumber,
        profilePhoto,
        licenseNumber,
        expirationDate,
        tcSignature
      );
    }
    throw new Error("Wrong contract type");
  }

  quoteUpdateCarInfo(request: ContractUpdateCarInfoRequest): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteUpdateCarInfo(request);
    }
    throw new Error("Wrong contract type");
  }

  quoteUpdateCarInfoWithLocation(
    request: ContractUpdateCarInfoRequest,
    location: ContractSignedLocationInfo,
    apiKey: string
  ): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteUpdateCarInfoWithLocation(
        request,
        location,
        apiKey
      );
    }
    throw new Error("Wrong contract type");
  }

  quotePayKycCommission(value: bigint, currency: string): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quotePayKycCommission(value, currency);
    }
    throw new Error("Wrong contract type");
  }

  quoteUseKycCommission(user: string): Promise<bigint> {
    if (!this.isDefaultNetwork) {
      return (this.currantChainContract as unknown as IRentalitySender).quoteUseKycCommission(user);
    }
    throw new Error("Wrong contract type");
  }
}
