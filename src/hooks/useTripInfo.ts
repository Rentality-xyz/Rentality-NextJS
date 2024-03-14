import { useEffect, useState } from "react";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { TripDetails } from "@/model/TripDetails";
import { useRentality } from "@/contexts/rentalityContext";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { ContractTripDTO } from "@/model/blockchain/schemas";

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

  paymentFrom: "",
  paymentTo: "",
  pricePerDayInUsdCents: 0,
  totalDayPriceInUsd: 0,
  taxPriceInUsd: 0,
  depositInUsd: 0,
  currencyType: 0,
  ethToCurrencyRate: 0,
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

      const timeZoneId = tripDTO.timeZoneId;

      let details: TripDetails = {
        tripId: tripDTO.trip.tripId,
        carId: tripDTO.trip.carId,
        status: getTripStatusTextFromStatus(tripDTO.trip.status),
        guest: tripDTO.trip.guest,
        host: tripDTO.trip.host,
        guestName: tripDTO.trip.guestName,
        hostName: tripDTO.trip.hostName,
        startDateTime: getDateFromBlockchainTimeWithTZ(tripDTO.trip.startDateTime, timeZoneId),
        endDateTime: getDateFromBlockchainTimeWithTZ(tripDTO.trip.endDateTime, timeZoneId),
        startLocation: tripDTO.trip.startLocation,
        endLocation: tripDTO.trip.endLocation,
        milesIncludedPerDay: Number(tripDTO.trip.milesIncludedPerDay),
        fuelPricePerGalInUsd: Number(tripDTO.trip.fuelPrice) / 100.0,
        approvedDateTime:
          tripDTO.trip.approvedDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(tripDTO.trip.approvedDateTime, timeZoneId)
            : undefined,
        checkedInByHostDateTime:
          tripDTO.trip.checkedInByHostDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(tripDTO.trip.checkedInByHostDateTime, timeZoneId)
            : undefined,
        startFuelLevelInPercents:
          tripDTO.trip.startParamLevels[0] > 0 ? Number(tripDTO.trip.startParamLevels[0]) : undefined,
        startOdometr: tripDTO.trip.startParamLevels[1] > 0 ? Number(tripDTO.trip.startParamLevels[1]) : undefined,
        checkedInByGuestDateTime:
          tripDTO.trip.checkedInByGuestDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(tripDTO.trip.checkedInByGuestDateTime, timeZoneId)
            : undefined,
        checkedOutByGuestDateTime:
          tripDTO.trip.checkedOutByGuestDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(tripDTO.trip.checkedOutByGuestDateTime, timeZoneId)
            : undefined,
        endFuelLevelInPercents: tripDTO.trip.endParamLevels[0] > 0 ? Number(tripDTO.trip.endParamLevels[0]) : undefined,
        endOdometr: tripDTO.trip.endParamLevels[1] > 0 ? Number(tripDTO.trip.endParamLevels[1]) : undefined,
        checkedOutByHostDateTime:
          tripDTO.trip.checkedOutByHostDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(tripDTO.trip.checkedOutByHostDateTime, timeZoneId)
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
        ethToCurrencyRate:
          Number(tripDTO.trip.paymentInfo.ethToCurrencyRate) /
          10 ** Number(tripDTO.trip.paymentInfo.ethToCurrencyDecimals),
        //ethToCurrencyDecimals: trip.paymentInfo.ethToCurrencyDecimals,
      };
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
