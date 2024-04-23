import { TripInfo } from "@/model/TripInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { isEmpty } from "@/utils/string";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { ContractTripDTO, EngineType, TripStatus } from "@/model/blockchain/schemas";
import { ContractTripContactInfo } from "@/model/blockchain/IRentalityContract";
import { displayMoneyFromCentsWith2Digits } from "@/utils/numericFormatters";

export const mapTripDTOtoTripInfo = async (i: ContractTripDTO, tripContactInfo: ContractTripContactInfo) => {
  const meta = await getMetaDataFromIpfs(i.metadataURI);
  const tripStatus = i.trip.status;
  const tankSize = Number(meta.attributes?.find((x: any) => x.trait_type === "Tank volume(gal)")?.value ?? "0");
  const timeZoneId = !isEmpty(i.timeZoneId) ? i.timeZoneId : UTC_TIME_ZONE_ID;

  let item: TripInfo = {
    tripId: Number(i.trip.tripId),

    carId: Number(i.trip.carId),
    image: getIpfsURIfromPinata(meta.image),
    carDescription: meta.attributes?.find((x: any) => x.trait_type === "Description")?.value ?? "Test Description",
    carDoorsNumber: meta.attributes?.find((x: any) => x.trait_type === "Doors Number")?.value ?? 4,
    carSeatsNumber: meta.attributes?.find((x: any) => x.trait_type === "Seats Number")?.value ?? 4,
    carTransmission: meta.attributes?.find((x: any) => x.trait_type === "Transmission")?.value ?? "",
    carColor: meta.attributes?.find((x: any) => x.trait_type === "Color")?.value ?? "",
    brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
    model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
    year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
    licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
    tankVolumeInGal: tankSize,
    engineType: i.trip.engineType,
    fuelPricePerGal: i.trip.engineType === EngineType.PATROL ? Number(i.trip.fuelPrice) / 100 : 0,
    fullBatteryChargePriceInUsdCents: i.trip.engineType === EngineType.ELECTRIC ? Number(i.trip.fuelPrice) / 100 : 0,
    milesIncludedPerDay: Number(i.trip.milesIncludedPerDay),
    timeZoneId: timeZoneId,
    overmilePrice: Number(i.trip.pricePerDayInUsdCents) / Number(i.trip.milesIncludedPerDay) / 100,

    status: tripStatus,
    tripStart: getDateFromBlockchainTimeWithTZ(i.trip.startDateTime, timeZoneId),
    tripEnd: getDateFromBlockchainTimeWithTZ(i.trip.endDateTime, timeZoneId),
    locationStart: i.trip.startLocation,
    locationEnd: i.trip.endLocation,
    allowedActions: [],
    startFuelLevelInPercents: Number(i.trip.startParamLevels[0]),
    endFuelLevelInPercents: Number(i.trip.endParamLevels[0]),
    startOdometr: Number(i.trip.startParamLevels[1]),
    endOdometr: Number(i.trip.endParamLevels[1]),

    rejectedBy: i.trip.rejectedBy,
    rejectedDate:
      i.trip.rejectedDateTime > 0 ? getDateFromBlockchainTimeWithTZ(i.trip.rejectedDateTime, timeZoneId) : undefined,
    createdDateTime: getDateFromBlockchainTimeWithTZ(i.trip.createdDateTime, timeZoneId),
    checkedInByHostDateTime: getDateFromBlockchainTimeWithTZ(i.trip.checkedInByHostDateTime, timeZoneId),
    checkedOutByGuestDateTime: getDateFromBlockchainTimeWithTZ(i.trip.checkedOutByGuestDateTime, timeZoneId),
    checkedOutByHostDateTime: getDateFromBlockchainTimeWithTZ(i.trip.checkedOutByHostDateTime, timeZoneId),

    hostPhoneNumber: formatPhoneNumber(tripContactInfo.hostPhoneNumber),
    guestPhoneNumber: formatPhoneNumber(tripContactInfo.guestPhoneNumber),
    hostAddress: i.trip.host,
    hostName: i.trip.hostName,
    guestAddress: i.trip.guest,
    guestName: i.trip.guestName,
    hostPhotoUrl: i.hostPhotoUrl,
    guestPhotoUrl: i.guestPhotoUrl,

    pricePerDayInUsd: Number(i.trip.pricePerDayInUsdCents) / 100.0,
    totalDayPriceInUsd: Number(i.trip.paymentInfo.totalDayPriceInUsdCents) / 100.0,
    totalPriceWithDiscountInUsd: Number(i.trip.paymentInfo.priceWithDiscount) / 100.0,
    taxPriceInUsd: Number(i.trip.paymentInfo.taxPriceInUsdCents) / 100.0,
    depositInUsd: Number(i.trip.paymentInfo.depositInUsdCents) / 100.0,

    resolveAmountInUsd: Number(i.trip.paymentInfo.resolveAmountInUsdCents) / 100.0,
    depositReturnedInUsd:
      tripStatus < TripStatus.Closed
        ? 0
        : Number(i.trip.paymentInfo.depositInUsdCents - i.trip.paymentInfo.resolveAmountInUsdCents) / 100.0,

    currencyRate: Number(i.trip.paymentInfo.currencyRate) / 10 ** Number(i.trip.paymentInfo.currencyDecimals),
  };
  return item;
};
