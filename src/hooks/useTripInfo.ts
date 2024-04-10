import { useEffect, useState } from "react";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { TripDetails } from "@/model/TripDetails";
import { useRentality } from "@/contexts/rentalityContext";
import { getDateFromBlockchainTime, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { ContractTripDTO } from "@/model/blockchain/schemas";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";

const emptyDetails: TripDetails = {
  tripId: BigInt(0),
  carId: BigInt(0),
  status: "",
  guest: "",
  host: "",
  guestName: "",
  hostName: "",
  startDateTime: new Date(),
  endDateTime: new Date(),
  startLocation: "",
  endLocation: "",
  milesIncludedPerDay: 0,
  fuelPricePerGalInUsd: 0,
  approvedDateTime: undefined,
  checkedInByHostDateTime: undefined,
  startFuelLevelInPercents: undefined,
  startOdometr: undefined,
  checkedInByGuestDateTime: undefined,
  checkedOutByGuestDateTime: undefined,
  endFuelLevelInPercents: undefined,
  endOdometr: undefined,
  checkedOutByHostDateTime: undefined,
  resolveAmountInUsd: undefined,
  timeZoneId: "",

  paymentFrom: "",
  paymentTo: "",
  pricePerDayInUsdCents: 0,
  totalDayPriceInUsd: 0,
  taxPriceInUsd: 0,
  depositInUsd: 0,
  currencyType: "",
  currencyRate: 0,
  currencyDecimals: 0,
};

const useTripDetails = (tripId: bigint) => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [tripDetails, setTripDetails] = useState<TripDetails>(emptyDetails);

  const getTrip = async (rentalityContract: IRentalityContract, tripId: bigint) => {
    try {
      if (rentalityContract == null) {
        console.error("getTrip error: contract is null");
        return;
      }
      const tripDTO: ContractTripDTO = await rentalityContract.getTrip(tripId);

      if (tripDTO === null) return;

	  const tripContactInfo = await rentalityContract.getTripContactInfo(tripDTO.trip.carId);
	  const details = await mapTripDTOtoTripInfo (tripDTO, tripContactInfo);

      /*let details: TripDetails = {
        tripId: tripDTO.trip.tripId,
        carId: tripDTO.trip.carId,
        status: getTripStatusTextFromStatus(tripDTO.trip.status),
        guest: tripDTO.trip.guest,
        host: tripDTO.trip.host,
        guestName: tripDTO.trip.guestName,
        hostName: tripDTO.trip.hostName,
        startDateTime: getDateFromBlockchainTime(tripDTO.trip.startDateTime),
        endDateTime: getDateFromBlockchainTime(tripDTO.trip.endDateTime),
        startLocation: tripDTO.trip.startLocation,
        endLocation: tripDTO.trip.endLocation,
        milesIncludedPerDay: Number(tripDTO.trip.milesIncludedPerDay),
        fuelPricePerGalInUsd: Number(tripDTO.trip.fuelPrice) / 100.0,
        approvedDateTime:
          tripDTO.trip.approvedDateTime > 0 ? getDateFromBlockchainTime(tripDTO.trip.approvedDateTime) : undefined,
        checkedInByHostDateTime:
          tripDTO.trip.checkedInByHostDateTime > 0
            ? getDateFromBlockchainTime(tripDTO.trip.checkedInByHostDateTime)
            : undefined,
        startFuelLevelInPercents:
          tripDTO.trip.startParamLevels[0] > 0 ? Number(tripDTO.trip.startParamLevels[0]) : undefined,
        startOdometr: tripDTO.trip.startParamLevels[1] > 0 ? Number(tripDTO.trip.startParamLevels[1]) : undefined,
        checkedInByGuestDateTime:
          tripDTO.trip.checkedInByGuestDateTime > 0
            ? getDateFromBlockchainTime(tripDTO.trip.checkedInByGuestDateTime)
            : undefined,
        checkedOutByGuestDateTime:
          tripDTO.trip.checkedOutByGuestDateTime > 0
            ? getDateFromBlockchainTime(tripDTO.trip.checkedOutByGuestDateTime)
            : undefined,
        endFuelLevelInPercents: tripDTO.trip.endParamLevels[0] > 0 ? Number(tripDTO.trip.endParamLevels[0]) : undefined,
        endOdometr: tripDTO.trip.endParamLevels[1] > 0 ? Number(tripDTO.trip.endParamLevels[1]) : undefined,
        checkedOutByHostDateTime:
          tripDTO.trip.checkedOutByHostDateTime > 0
            ? getDateFromBlockchainTime(tripDTO.trip.checkedOutByHostDateTime)
            : undefined,

        paymentFrom: tripDTO.trip.paymentInfo.from,
        paymentTo: tripDTO.trip.paymentInfo.to,
        pricePerDayInUsdCents: Number(tripDTO.trip.pricePerDayInUsdCents) / 100.0,
        totalDayPriceInUsd: Number(tripDTO.trip.paymentInfo.totalDayPriceInUsdCents) / 100.0,
        taxPriceInUsd: Number(tripDTO.trip.paymentInfo.taxPriceInUsdCents) / 100.0,
        depositInUsd: Number(tripDTO.trip.paymentInfo.depositInUsdCents) / 100.0,
        resolveAmountInUsd:
          tripDTO.trip.paymentInfo.resolveAmountInUsdCents > 0
            ? Number(tripDTO.trip.paymentInfo.resolveAmountInUsdCents) / 100.0
            : undefined,
        currencyType: tripDTO.trip.paymentInfo.currencyType,
        currencyRate:
          Number(tripDTO.trip.paymentInfo.currencyRate) / 10 ** Number(tripDTO.trip.paymentInfo.currencyDecimals),
        currencyDecimals: Number(tripDTO.trip.paymentInfo.currencyDecimals),
        timeZoneId: timeZoneId,
      };*/
      return details;
    } catch (e) {
      console.error("getTrip error:" + e);
    }
  };

  useEffect(() => {
    if (!rentalityContract) return;

    getTrip(rentalityContract, tripId)
      .then((data) => {
        setTripDetails(data ?? emptyDetails);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContract, tripId]);

  return [isLoading, tripDetails] as const;
};

export default useTripDetails;
