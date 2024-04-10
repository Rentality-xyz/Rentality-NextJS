import { TripInfo } from "@/model/TripInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { isEmpty } from "@/utils/string";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { ContractTripDTO, EngineType } from "@/model/blockchain/schemas";
import { ContractTripContactInfo } from "@/model/blockchain/IRentalityContract"

export const mapTripDTOtoTripInfo = async (i: ContractTripDTO, tripContactInfo: ContractTripContactInfo) => {

	const meta = await getMetaDataFromIpfs(i.metadataURI);
	const tripStatus = i.trip.status;
	const tankSize = Number(
		meta.attributes?.find((x: any) => x.trait_type === "Tank volume(gal)")?.value ?? "0"
	);
	const timeZoneId = !isEmpty(i.timeZoneId) ? i.timeZoneId : UTC_TIME_ZONE_ID;

	let item: TripInfo = {
		tripId: Number(i.trip.tripId),
		carId: Number(i.trip.carId),
		image: getIpfsURIfromPinata(meta.image),
		brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
		model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
		year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
		licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
		tripStart: getDateFromBlockchainTimeWithTZ(i.trip.startDateTime, timeZoneId),
		tripEnd: getDateFromBlockchainTimeWithTZ(i.trip.endDateTime, timeZoneId),
		locationStart: i.trip.startLocation,
		locationEnd: i.trip.endLocation,
		status: tripStatus,
		allowedActions: [],
		totalPrice: (Number(i.trip.paymentInfo.totalDayPriceInUsdCents) / 100).toString(),
		tankVolumeInGal: tankSize,
		startFuelLevelInPercents: Number(i.trip.startParamLevels[0]),
		endFuelLevelInPercents: Number(i.trip.endParamLevels[0]),
		engineType: i.trip.engineType,
		fuelPricePerGal: i.trip.engineType === EngineType.PATROL ? Number(i.trip.fuelPrice) / 100 : 0,
		fullBatteryChargePriceInUsdCents:
			i.trip.engineType === EngineType.ELECTRIC ? Number(i.trip.fuelPrice) / 100 : 0,
		milesIncludedPerDay: Number(i.trip.milesIncludedPerDay),
		startOdometr: Number(i.trip.startParamLevels[1]),
		endOdometr: Number(i.trip.endParamLevels[1]),
		depositPaid: Number(i.trip.paymentInfo.depositInUsdCents) / 100,
		overmilePrice: Number(i.trip.pricePerDayInUsdCents) / Number(i.trip.milesIncludedPerDay) / 100,
		hostPhoneNumber: formatPhoneNumber(tripContactInfo.hostPhoneNumber),
		guestPhoneNumber: formatPhoneNumber(tripContactInfo.guestPhoneNumber),
		hostAddress: i.trip.host,
		hostName: i.trip.hostName,
		guestAddress: i.trip.guest,
		guestName: i.trip.guestName,
		rejectedBy: i.trip.rejectedBy,
		rejectedDate:
			i.trip.rejectedDateTime > 0
				? getDateFromBlockchainTimeWithTZ(i.trip.rejectedDateTime, timeZoneId)
				: undefined,
		createdDateTime: getDateFromBlockchainTimeWithTZ(i.trip.createdDateTime, timeZoneId),
		checkedInByHostDateTime: getDateFromBlockchainTimeWithTZ(
			i.trip.checkedInByHostDateTime,
			timeZoneId
		),
		checkedOutByGuestDateTime: getDateFromBlockchainTimeWithTZ(
			i.trip.checkedOutByGuestDateTime,
			timeZoneId
		),
		checkedOutByHostDateTime: getDateFromBlockchainTimeWithTZ(
			i.trip.checkedOutByHostDateTime,
			timeZoneId
		),
		hostPhotoUrl: i.hostPhotoUrl,
		guestPhotoUrl: i.guestPhotoUrl,
		timeZoneId: timeZoneId,
		pricePerDayInUsdCents: Number(i.trip.pricePerDayInUsdCents) / 100.0,
		totalDayPriceInUsd: Number(i.trip.paymentInfo.totalDayPriceInUsdCents) / 100.0,
		taxPriceInUsd: Number(i.trip.paymentInfo.taxPriceInUsdCents) / 100.0,
		depositInUsd: Number(i.trip.paymentInfo.depositInUsdCents) / 100.0,
		currencyRate:
          Number(i.trip.paymentInfo.currencyRate) / 10 ** Number(i.trip.paymentInfo.currencyDecimals),
	};
	return item;
};
