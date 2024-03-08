import { useEffect, useState } from "react";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { TripDetails } from "@/model/TripDetails";
import { useRentality } from "@/contexts/rentalityContext";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { ContractCarDetails, ContractTrip } from "@/model/blockchain/schemas";

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
      const trip: ContractTrip = await rentalityContract.getTrip(tripId);
      const carDetails: ContractCarDetails = await rentalityContract.getCarDetails(trip.carId);
      const timeZoneId = carDetails.timeZoneId;

      if (trip == null) return;

      let details: TripDetails = {
        tripId: trip.tripId,
        carId: trip.carId,
        status: getTripStatusTextFromStatus(trip.status),
        guest: trip.guest,
        host: trip.host,
        guestName: trip.guestName,
        hostName: trip.hostName,
        startDateTime: getDateFromBlockchainTimeWithTZ(trip.startDateTime, timeZoneId),
        endDateTime: getDateFromBlockchainTimeWithTZ(trip.endDateTime, timeZoneId),
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        milesIncludedPerDay: Number(trip.milesIncludedPerDay),
        fuelPricePerGalInUsd: Number(trip.fuelPrice) / 100.0,
        approvedDateTime:
          trip.approvedDateTime > 0 ? getDateFromBlockchainTimeWithTZ(trip.approvedDateTime, timeZoneId) : undefined,
        checkedInByHostDateTime:
          trip.checkedInByHostDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(trip.checkedInByHostDateTime, timeZoneId)
            : undefined,
        startFuelLevelInPercents: trip.startParamLevels[0] > 0 ? Number(trip.startParamLevels[0]) : undefined,
        startOdometr: trip.startParamLevels[1] > 0 ? Number(trip.startParamLevels[1]) : undefined,
        checkedInByGuestDateTime:
          trip.checkedInByGuestDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(trip.checkedInByGuestDateTime, timeZoneId)
            : undefined,
        checkedOutByGuestDateTime:
          trip.checkedOutByGuestDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(trip.checkedOutByGuestDateTime, timeZoneId)
            : undefined,
        endFuelLevelInPercents: trip.endParamLevels[0] > 0 ? Number(trip.endParamLevels[0]) : undefined,
        endOdometr: trip.endParamLevels[1] > 0 ? Number(trip.endParamLevels[1]) : undefined,
        checkedOutByHostDateTime:
          trip.checkedOutByHostDateTime > 0
            ? getDateFromBlockchainTimeWithTZ(trip.checkedOutByHostDateTime, timeZoneId)
            : undefined,

        paymentFrom: trip.paymentInfo.from,
        paymentTo: trip.paymentInfo.to,
        pricePerDayInUsdCents: Number(trip.pricePerDayInUsdCents) / 100.0,
        totalDayPriceInUsd: Number(trip.paymentInfo.totalDayPriceInUsdCents) / 100.0,
        taxPriceInUsd: Number(trip.paymentInfo.taxPriceInUsdCents) / 100.0,
        depositInUsd: Number(trip.paymentInfo.depositInUsdCents) / 100.0,
        resolveAmountInUsd:
          trip.paymentInfo.resolveAmountInUsdCents > 0
            ? Number(trip.paymentInfo.resolveAmountInUsdCents) / 100.0
            : undefined,
        currencyType: trip.paymentInfo.currencyType,
        ethToCurrencyRate:
          Number(trip.paymentInfo.ethToCurrencyRate) / 10 ** Number(trip.paymentInfo.ethToCurrencyDecimals),
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
