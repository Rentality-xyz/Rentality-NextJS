import { TripInfo, TripInfoShortDetails } from "@/model/TripInfo";
import { getIpfsURI, getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { isEmpty } from "@/utils/string";
import { EngineType, TripStatus } from "@/model/blockchain/schemas";
import { getDiscountablePrice, getNotDiscountablePrice } from "@/utils/price";
import { getPromoPrice } from "@/features/promocodes/utils";
import { addSpacesBeforeUpperCase } from "@/utils/spaceBeforeUpperCase";
import { camelToTitleCase } from "@/utils/camelToTitleCase";
import { UTC_TIME_ZONE_ID } from "@/utils/constants";
import { calculateDaysByBlockchainLogic } from "@/utils/date";
import { TaxData, TripEntity } from "@/pages/api/queryTrips";


export async function mapTripEntityToTripInfo(
  entity: TripEntity,
  isCarDetailsConfirmed?: boolean
): Promise<TripInfo> {
  const tokenURI = entity.car.car.tokenURI || '';
  const metaDataRaw = tokenURI ? await getMetaDataFromIpfs(tokenURI) : undefined;
  const metaData = metaDataRaw ? parseMetaData(metaDataRaw) : {} as any;
  
  const timeZoneId = !isEmpty(entity.car.car.locationInfo.timeZoneId)
    ? entity.car.car.locationInfo.timeZoneId
    : UTC_TIME_ZONE_ID;

  // Compute overmile and trip days
  const startOdometer = Number(entity.startParamLevels[1] || 0);
  const endOdometer = Number(entity.endParamLevels[1] || 0);
  const milesIncludedPerDay = entity.milesIncludedPerDay;

  const tripStartDate = getDateFromBlockchainTimeWithTZ(entity.startDateTime, timeZoneId);
  const tripEndDate = getDateFromBlockchainTimeWithTZ(entity.endDateTime, timeZoneId);
  const tripDays = calculateDaysByBlockchainLogic(tripStartDate, tripEndDate);

  let overmileValue = endOdometer - startOdometer - milesIncludedPerDay * tripDays;
  overmileValue = overmileValue > 0 ? overmileValue : 0;

  const overmilePrice = Math.ceil(entity.pricePerDayInUsdCents / milesIncludedPerDay) / 100;
  const tankVolumeInGal = metaData.tankVolumeInGal ?? 0;

  const insurancePerDayInUsd = entity.paidForInsuranceInUsdCents / 100 / tripDays;

  // Use single insuranceInfo if present
  const insInfo = entity.insuranceInfo;
  const guestInsurancePhoto = '';

  // Pricing
  const pricePerDayUsd = entity.pricePerDayInUsdCents / 100;
  const totalWithDiscount = entity.paymentInfo.priceWithDiscount / 100;
  const pickUpFee = entity.paymentInfo.pickUpFee / 100;
  const dropOffFee = entity.paymentInfo.dropOfFee / 100;
  const depositUsd = entity.paymentInfo.depositInUsdCents / 100;
  const totalTaxes = (entity.taxesData || []).reduce((sum, t) => sum + t.value / 100, 0);
  const totalPrice = totalWithDiscount + totalTaxes + pickUpFee + dropOffFee;
  const promoPct = entity.promoDiscount;

  const paidByGuest = promoPct > 0
    ? getPromoPrice(
        getDiscountablePrice(totalWithDiscount, pickUpFee, dropOffFee, totalTaxes),
        promoPct
      ) +
      (promoPct !== 100 ? getNotDiscountablePrice(entity.paidForInsuranceInUsdCents / 100, depositUsd) : 0)
    : totalPrice;

  const currencyRate = entity.paymentInfo.currencyRate / 10 ** entity.paymentInfo.currencyDecimals;

  const hostInfo = entity.host;
  const guestInfo = entity.guest;

  const mapped: TripInfo = {
    tripId: Number(entity.id),
    carId: Number(entity.carId),
    carVinNumber: metaData.vinNumber,
    image: getIpfsURI(metaData.mainImage),
    carDescription: metaData.description,
    carDoorsNumber: metaData.doorsNumber,
    carSeatsNumber: metaData.seatsNumber,
    carTransmission: metaData.transmission,
    carColor: metaData.color,
    brand: entity.car.car.brand || metaData.brand,
    model: entity.car.car.model || metaData.model,
    year: entity.car.car.yearOfProduction.toString(),
    licensePlate: metaData.licensePlate,
    licenseState: metaData.licenseState,
    tankVolumeInGal,
    engineType: BigInt(entity.engineType) as EngineType,
    pricePer10PercentFuel: BigInt(entity.engineType) === EngineType.PETROL
      ? (entity.fuelPrice * tankVolumeInGal) / 1000
      : entity.fuelPrice / 1000,
    milesIncludedPerDay,
    milesIncludedPerTrip: milesIncludedPerDay * tripDays,
    timeZoneId,
    overmilePrice,
    overmileValue,
    status: BigInt(entity.status),
    tripStart: tripStartDate,
    tripEnd: tripEndDate,
    tripDays,
    locationStart: `${entity.pickUpLocation?.city}, ${entity.pickUpLocation?.state}`,
    locationEnd: `${entity.dropOfLocation?.city}, ${entity.dropOfLocation?.state}`,
    allowedActions: [],
    startFuelLevelInPercents: Number(entity.startParamLevels[0] || 0),
    endFuelLevelInPercents: Number(entity.endParamLevels[0] || 0),
    startOdometr: startOdometer,
    endOdometr: endOdometer,
    rejectedBy: entity.rejectedBy!,
    tripStartedBy: entity.tripStartedBy!,
    tripFinishedBy: entity.tripFinishedBy!,
    rejectedDate: entity.rejectedDateTime && entity.rejectedDateTime > 0
      ? getDateFromBlockchainTimeWithTZ(entity.rejectedDateTime, timeZoneId)
      : undefined,
    isTripRejected: !!entity.rejectedDateTime && !entity.approvedDateTime,
    isTripCanceled: !!entity.rejectedDateTime && !!entity.approvedDateTime,
    createdDateTime: getDateFromBlockchainTimeWithTZ(entity.createdDateTime, timeZoneId),
    approvedDateTime: getDateFromBlockchainTimeWithTZ(entity.approvedDateTime!, timeZoneId),
      
    checkedInByHostDateTime: getDateFromBlockchainTimeWithTZ(entity.checkedInByHostDateTime!, timeZoneId),
    checkedInByGuestDateTime: getDateFromBlockchainTimeWithTZ(entity.checkedInByGuestDateTime!, timeZoneId),
    checkedOutByGuestDateTime: getDateFromBlockchainTimeWithTZ(entity.checkedOutByGuestDateTime!, timeZoneId),
    checkedOutByHostDateTime: getDateFromBlockchainTimeWithTZ(entity.checkedOutByHostDateTime!, timeZoneId),
    finishedDateTime: getDateFromBlockchainTimeWithTZ(entity.finishDateTime!, timeZoneId),
    dimoTokenId: Number(entity.car.car.dimoTokenId ?? 0),
    host: {
      walletAddress: hostInfo.id,
      name: hostInfo.name,
      phoneNumber: formatPhoneNumber(hostInfo.mobilePhoneNumber || ''),
      photoUrl: hostInfo.profilePhoto || '',
      drivingLicenseNumber: hostInfo.licenseNumber || '',
      drivingLicenseExpirationDate: getDateFromBlockchainTimeWithTZ(hostInfo.expirationDate as any, UTC_TIME_ZONE_ID),
    },
    guest: {
      walletAddress: guestInfo.id,
      name: guestInfo.name,
      phoneNumber: formatPhoneNumber(guestInfo.mobilePhoneNumber || ''),
      photoUrl: guestInfo.profilePhoto || '',
      drivingLicenseNumber: guestInfo.licenseNumber || '',
      drivingLicenseExpirationDate:  getDateFromBlockchainTimeWithTZ(guestInfo.expirationDate as any, UTC_TIME_ZONE_ID),
      drivingLicenseIssueCountry: entity.guestDrivingLicenseIssueCountry!,
    },
    guestInsuranceCompanyName: insInfo?.companyName || '',
    guestInsurancePolicyNumber: insInfo?.policyNumber || '',
    pricePerDayInUsd: pricePerDayUsd,
    totalDayPriceInUsd: entity.paymentInfo.totalDayPriceInUsdCents / 100,
    totalPriceWithHostDiscountInUsd: totalWithDiscount,
    pickUpDeliveryFeeInUsd: pickUpFee,
    dropOffDeliveryFeeInUsd: dropOffFee,
    depositInUsd: depositUsd,
    totalPriceInUsd: totalPrice,
    paidByGuestInUsd: paidByGuest,
    resolveAmountInUsd: entity.paymentInfo.resolveAmountInUsdCents / 100,
    resolveFuelAmountInUsd: entity.paymentInfo.resolveFuelAmountInUsdCents / 100,
    resolveMilesAmountInUsd: entity.paymentInfo.resolveMilesAmountInUsdCents / 100,
    depositReturnedInUsd: 0,
    currencyRate,
    isCarDetailsConfirmed: isCarDetailsConfirmed ?? false,
    insurancePerDayInUsd,
    insuranceTotalInUsd: insurancePerDayInUsd * tripDays,
    guestInsurancePhoto,
    taxesData: (entity.taxesData || []).map((t: TaxData) => ({
      name: camelToTitleCase(addSpacesBeforeUpperCase(t.name)),
      value: t.value / 100,
      tType: Number(t.tType),
    })),
    currency: entity.paymentInfo.currencyType,
  };

  return mapped;
}

export function mapTripEntityToTripInfoShortDetails(
  entity: TripEntity
): TripInfoShortDetails {
  const timeZoneId = !isEmpty(entity.car.car.locationInfo.timeZoneId)
    ? entity.car.car.locationInfo.timeZoneId
    : UTC_TIME_ZONE_ID;

  const startDate = getDateFromBlockchainTimeWithTZ(entity.startDateTime, timeZoneId);
  const endDate = getDateFromBlockchainTimeWithTZ(entity.endDateTime, timeZoneId);
  const tripDays = calculateDaysByBlockchainLogic(startDate, endDate);

  return {
    tripId: Number(entity.id),
    carId: Number(entity.carId),
    brand: entity.car.car.brand,
    model: entity.car.car.model,
    year: entity.car.car.yearOfProduction.toString(),
    timeZoneId,
    status: BigInt(entity.status)as TripStatus,
    tripStart: startDate,
    tripEnd: endDate,
    tripDays,
    locationStart: `${entity.pickUpLocation?.city}, ${entity.pickUpLocation?.state}`,
    locationEnd: `${entity.dropOfLocation?.city}, ${entity.dropOfLocation?.state}`,
    rejectedBy: entity.rejectedBy!,
    rejectedDate: entity.rejectedDateTime && entity.rejectedDateTime > 0
      ? getDateFromBlockchainTimeWithTZ(entity.rejectedDateTime, timeZoneId)
      : undefined,
    isTripRejected: !!entity.rejectedDateTime && !entity.approvedDateTime,
    isTripCanceled: !!entity.rejectedDateTime && !!entity.approvedDateTime,
    host: {
      walletAddress: entity.host.id,
      name: entity.host.name,
      phoneNumber: formatPhoneNumber(entity.host.mobilePhoneNumber || ''),
      photoUrl: entity.host.profilePhoto || '',
      drivingLicenseNumber: entity.host.licenseNumber || '',
      drivingLicenseExpirationDate: getDateFromBlockchainTimeWithTZ(entity.host.expirationDate as any, UTC_TIME_ZONE_ID)
       
    },
    guest: {
      walletAddress: entity.guest.id,
      name: entity.guest.name,
      phoneNumber: formatPhoneNumber(entity.guest.mobilePhoneNumber || ''),
      photoUrl: entity.guest.profilePhoto || '',
      drivingLicenseNumber: entity.guest.licenseNumber || '',
      drivingLicenseExpirationDate: getDateFromBlockchainTimeWithTZ(entity.guest.expirationDate as any, UTC_TIME_ZONE_ID),
     
      drivingLicenseIssueCountry: entity.guestDrivingLicenseIssueCountry!,
    },
  };
}
