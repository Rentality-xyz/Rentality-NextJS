import {
  ContractAdminKYCInfoDTO,
  ContractAdminKYCInfosDTO,
  ContractCarInfo,
  ContractCarInfoDTO,
  ContractCarInfoWithInsurance,
  ContractCreateCarRequest,
  ContractFullKYCInfoDTO,
  ContractInsuranceInfo,
  ContractSignedLocationInfo,
  ContractTaxValue,
  ContractTrip,
  ContractTripDTO,
  ContractUpdateCarInfoRequest,
  ContractUserCurrencyDTO,
} from "@/model/blockchain/schemas";
import { Ok } from "@/model/utils/result";
import { IRentalityAdminGateway } from "./IRentalityAdminGateway";
import { IRentalityGateway } from "./IRentalityGateway";

function mapCarInfo(raw: any): ContractCarInfo {
  if (raw?.carId !== undefined) {
    return raw as ContractCarInfo;
  }

  return {
    carId: raw.asset.id,
    carVinNumber: raw.car.carVinNumber,
    carVinNumberHash: raw.car.carVinNumberHash,
    createdBy: raw.asset.owner,
    brand: raw.car.brand,
    model: raw.car.model,
    yearOfProduction: raw.car.yearOfProduction,
    pricePerDayInUsdCents: raw.car.pricePerDayInUsdCents,
    securityDepositPerTripInUsdCents: raw.car.securityDepositPerTripInUsdCents,
    engineType: raw.car.engineType,
    engineParams: raw.car.engineParams,
    milesIncludedPerDay: raw.car.milesIncludedPerDay,
    timeBufferBetweenTripsInSec: raw.car.timeBufferBetweenTripsInSec,
    currentlyListed: raw.car.currentlyListed,
    geoVerified: raw.car.geoVerified,
    timeZoneId: raw.car.timeZoneId,
    insuranceIncluded: raw.car.insuranceIncluded,
    locationHash: raw.car.locationHash,
  };
}

function mapCarInfoDTO(raw: any): ContractCarInfoDTO {
  if (raw?.carInfo?.carId !== undefined) {
    return raw as ContractCarInfoDTO;
  }

  return {
    carInfo: mapCarInfo(raw.carInfo),
    metadataURI: raw.metadataURI,
    isEditable: raw.isEditable,
    dimoTokenId: raw.dimoTokenId,
  };
}

function mapCarInfoWithInsurance(raw: any): ContractCarInfoWithInsurance {
  if (raw?.carInfo?.carId !== undefined) {
    return raw as ContractCarInfoWithInsurance;
  }

  return {
    carInfo: mapCarInfo(raw.carInfo),
    insuranceInfo: raw.insuranceInfo,
    carMetadataURI: raw.carMetadataURI,
  };
}

function mapKycInfo(raw: any): ContractFullKYCInfoDTO {
  if (raw?.kyc?.isTCPassed !== undefined) {
    return raw as ContractFullKYCInfoDTO;
  }

  return {
    kyc: {
      name: raw.kyc.name,
      surname: raw.kyc.surname,
      mobilePhoneNumber: raw.kyc.mobilePhoneNumber,
      profilePhoto: raw.kyc.profilePhoto,
      licenseNumber: raw.kyc.licenseNumber,
      expirationDate: raw.kyc.expirationDate,
      createDate: raw.kyc.createDate,
      isTCPassed: raw.kyc.isTermsPassed,
      TCSignature: raw.kyc.termsSignature,
    },
    additionalKYC: raw.additionalKYC,
    isPhoneVerified: raw.contact.isPhoneVerified,
    isEmailVerified: raw.contact.isEmailVerified,
    pushToken: raw.contact.pushToken,
  };
}

function mapAdminKycInfo(raw: any): ContractAdminKYCInfoDTO {
  if (raw?.kyc?.isTCPassed !== undefined) {
    return raw as ContractAdminKYCInfoDTO;
  }

  return {
    kyc: {
      name: raw.kyc.name,
      surname: raw.kyc.surname,
      mobilePhoneNumber: raw.kyc.mobilePhoneNumber,
      profilePhoto: raw.kyc.profilePhoto,
      licenseNumber: raw.kyc.licenseNumber,
      expirationDate: raw.kyc.expirationDate,
      createDate: raw.kyc.createDate,
      isTCPassed: raw.kyc.isTermsPassed,
      TCSignature: raw.kyc.termsSignature,
    },
    additionalKYC: raw.additionalKYC,
    wallet: raw.wallet,
    isEmailVerified: raw.isEmailVerified,
    pushToken: raw.pushToken,
  };
}

function mapAdminKycPage(raw: any): ContractAdminKYCInfosDTO {
  if (raw?.kycInfos !== undefined) {
    return raw as ContractAdminKYCInfosDTO;
  }

  return {
    kycInfos: (raw.profiles ?? []).map(mapAdminKycInfo),
    totalPageCount: raw.totalPageCount,
  };
}

function mapTaxValue(raw: any): ContractTaxValue {
  if (raw?.tType !== undefined) {
    return raw as ContractTaxValue;
  }

  return {
    name: raw.name,
    value: raw.value,
    tType: raw.taxType,
  };
}

function mapInsuranceInfo(raw: any): ContractInsuranceInfo {
  return raw as ContractInsuranceInfo;
}

function mapUserCurrency(raw: any): ContractUserCurrencyDTO {
  return raw as ContractUserCurrencyDTO;
}

function mapTrip(raw: any): ContractTrip {
  if (raw?.tripId !== undefined) {
    return raw as ContractTrip;
  }

  return {
    tripId: raw.booking.id,
    carId: raw.booking.resourceId,
    status: raw.status,
    guest: raw.booking.customer,
    host: raw.booking.provider,
    guestName: raw.guestName,
    hostName: raw.hostName,
    pricePerDayInUsdCents: raw.pricePerDayInUsdCents,
    startDateTime: raw.booking.startDateTime,
    endDateTime: raw.booking.endDateTime,
    engineType: raw.engineType,
    milesIncludedPerDay: raw.milesIncludedPerDay,
    fuelPrice: raw.fuelPrice,
    paymentInfo: raw.paymentInfo,
    createdDateTime: raw.booking.createdAt,
    approvedDateTime: raw.approvedDateTime,
    rejectedDateTime: raw.rejectedDateTime,
    guestInsuranceCompanyName: raw.guestInsuranceCompanyName,
    guestInsurancePolicyNumber: raw.guestInsurancePolicyNumber,
    rejectedBy: raw.rejectedBy,
    checkedInByHostDateTime: raw.checkedInByHostDateTime,
    startParamLevels: raw.startParamLevels,
    checkedInByGuestDateTime: raw.checkedInByGuestDateTime,
    tripStartedBy: raw.tripStartedBy,
    checkedOutByGuestDateTime: raw.checkedOutByGuestDateTime,
    tripFinishedBy: raw.tripFinishedBy,
    endParamLevels: raw.endParamLevels,
    checkedOutByHostDateTime: raw.checkedOutByHostDateTime,
    transactionInfo: raw.transactionInfo,
    finishDateTime: raw.finishDateTime,
    pickUpHash: raw.pickUpHash,
    returnHash: raw.returnHash,
  };
}

function mapTripDTO(raw: any): ContractTripDTO {
  if (raw?.trip?.tripId !== undefined) {
    return raw as ContractTripDTO;
  }

  return {
    trip: mapTrip(raw.trip),
    guestPhotoUrl: raw.guestPhotoUrl,
    hostPhotoUrl: raw.hostPhotoUrl,
    metadataURI: raw.metadataURI,
    timeZoneId: raw.timeZoneId,
    hostDrivingLicenseNumber: raw.hostDrivingLicenseNumber,
    hostDrivingLicenseExpirationDate: raw.hostDrivingLicenseExpirationDate,
    guestDrivingLicenseNumber: raw.guestDrivingLicenseNumber,
    guestDrivingLicenseExpirationDate: raw.guestDrivingLicenseExpirationDate,
    model: raw.model,
    brand: raw.brand,
    yearOfProduction: raw.yearOfProduction,
    pickUpLocation: raw.pickUpLocation,
    returnLocation: raw.returnLocation,
    guestPhoneNumber: raw.guestPhoneNumber,
    hostPhoneNumber: raw.hostPhoneNumber,
    insurancesInfo: raw.insurancesInfo.map(mapInsuranceInfo),
    paidForInsuranceInUsdCents: raw.paidForInsuranceInUsdCents,
    paidToInsuranceInUsdCents: raw.paidToInsuranceInUsdCents,
    guestDrivingLicenseIssueCountry: raw.guestDrivingLicenseIssueCountry,
    promoDiscount: raw.promoDiscount,
    dimoTokenId: raw.dimoTokenId,
    taxesData: raw.taxesData.map(mapTaxValue),
    currency: mapUserCurrency(raw.currency),
    guestNickName: raw.guestNickName,
    hostNickName: raw.hostNickName,
  };
}

const readMappers: Record<string, (value: any) => any> = {
  getMyFullKYCInfo: mapKycInfo,
  getUserFullKYCInfo: mapKycInfo,
  getPlatformUsersInfo: mapAdminKycPage,
  getPlatformUsersKYCInfos: mapAdminKycPage,
  getMyCars: (value: any[]) => value.map(mapCarInfoDTO),
  getCarInfoById: mapCarInfoWithInsurance,
  getTrip: mapTripDTO,
  getTripsAs: (value: any[]) => value.map(mapTripDTO),
};

const writeArgumentAdapters: Record<string, (...args: any[]) => any[]> = {
  addCar: (request: ContractCreateCarRequest) => [
    {
      asset: {
        name: "",
        metadataURI: request.tokenUri,
      },
      carVinNumber: request.carVinNumber,
      brand: request.brand,
      model: request.model,
      yearOfProduction: request.yearOfProduction,
      pricePerDayInUsdCents: request.pricePerDayInUsdCents,
      securityDepositPerTripInUsdCents: request.securityDepositPerTripInUsdCents,
      engineParams: request.engineParams,
      engineType: request.engineType,
      milesIncludedPerDay: request.milesIncludedPerDay,
      timeBufferBetweenTripsInSec: request.timeBufferBetweenTripsInSec,
      locationInfo: request.locationInfo,
      currentlyListed: request.currentlyListed,
    },
    request.insurancePriceInUsdCents,
    request.insuranceRequired,
    request.dimoTokenId,
    request.signedDimoTokenId,
  ],
  updateCarInfoWithLocation: (request: ContractUpdateCarInfoRequest, location: ContractSignedLocationInfo) => {
    const updateLocation = !!location?.signature && location.signature !== "0x";

    return [
      request.carId,
      {
        asset: {
          name: "",
          metadataURI: request.tokenUri,
        },
        pricePerDayInUsdCents: request.pricePerDayInUsdCents,
        securityDepositPerTripInUsdCents: request.securityDepositPerTripInUsdCents,
        engineParams: request.engineParams,
        milesIncludedPerDay: request.milesIncludedPerDay,
        timeBufferBetweenTripsInSec: request.timeBufferBetweenTripsInSec,
        currentlyListed: request.currentlyListed,
        engineType: request.engineType,
        location: location.locationInfo,
        updateLocation,
      },
      location,
      request.insurancePriceInUsdCents,
      request.insuranceRequired,
    ];
  },
};

function withMappedResultProxy<T>(proxyContract: T): T {
  return new Proxy(proxyContract as object, {
    get(target, key, receiver) {
      const originalMethod = Reflect.get(target, key, receiver);

      if (typeof originalMethod !== "function") {
        return originalMethod;
      }

      const mapper = readMappers[key.toString()];
      const writeArgumentAdapter = writeArgumentAdapters[key.toString()];

      if (!mapper && !writeArgumentAdapter) {
        return originalMethod;
      }

      const methodToCall = async (...args: any[]) => {
        const adaptedArgs = writeArgumentAdapter ? writeArgumentAdapter(...args) : args;
        const result = await originalMethod.apply(target, adaptedArgs);
        if (!mapper || !result || !result.ok) {
          return result;
        }

        return Ok(mapper(result.value));
      };

      if (!mapper) {
        return methodToCall;
      }

      return methodToCall;
    },
  }) as T;
}

export function withGatewayReadResultMapper(gateway: IRentalityGateway): IRentalityGateway {
  return withMappedResultProxy(gateway);
}

export function withAdminReadResultMapper(admin: IRentalityAdminGateway): IRentalityAdminGateway {
  return withMappedResultProxy(admin);
}
