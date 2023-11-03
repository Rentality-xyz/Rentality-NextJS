import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../abis";
import { ContractTrip, getTripStatusFromContract } from "@/model/blockchain/ContractTrip";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { TripDetails } from "@/model/TripDetails";

const useTripDetails = (tripId: bigint) => {
  const emptyDetails: TripDetails = {
    tripId: BigInt(0),
    carId: BigInt(0),
    status: "",
    guest: "",
    host: "",
    startDateTime: new Date(),
    endDateTime: new Date(),
    startLocation: "",
    endLocation: "",
    milesIncludedPerDay: 0,
    fuelPricePerGalInUsd: 0,
    approvedDateTime: undefined,
    checkedInByHostDateTime: undefined,
    startFuelLevelInGal: undefined,
    startOdometr: undefined,
    checkedInByGuestDateTime: undefined,
    checkedOutByGuestDateTime: undefined,
    endFuelLevelInGal: undefined,
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

  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [tripDetails, setTripDetails] = useState<TripDetails>(emptyDetails);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(rentalityJSON.address, rentalityJSON.abi, signer) as unknown as IRentalityContract;
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

  const getTrip = async (rentalityContract: IRentalityContract, tripId: bigint) => {
    try {
      if (rentalityContract == null) {
        console.error("getTrip error: contract is null");
        return;
      }
      const trip: ContractTrip = await rentalityContract.getTrip(tripId);

      if (trip == null) return;

      let details: TripDetails = {
        tripId: trip.tripId,
        carId: trip.carId,
        status: getTripStatusTextFromStatus(getTripStatusFromContract(Number(trip.status))),
        guest: trip.guest,
        host: trip.host,
        startDateTime: new Date(Number(trip.startDateTime) * 1000),
        endDateTime: new Date(Number(trip.endDateTime) * 1000),
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        milesIncludedPerDay: trip.milesIncludedPerDay,
        fuelPricePerGalInUsd: Number(trip.fuelPricePerGalInUsdCents) / 100.0,
        approvedDateTime: trip.approvedDateTime > 0 ? new Date(Number(trip.approvedDateTime) * 1000) : undefined,
        checkedInByHostDateTime:
          trip.checkedInByHostDateTime > 0 ? new Date(Number(trip.checkedInByHostDateTime) * 1000) : undefined,
        startFuelLevelInGal: trip.startFuelLevelInGal > 0 ? Number(trip.startFuelLevelInGal) : undefined,
        startOdometr: trip.startOdometr > 0 ? Number(trip.startOdometr) : undefined,
        checkedInByGuestDateTime:
          trip.checkedInByGuestDateTime > 0 ? new Date(Number(trip.checkedInByGuestDateTime) * 1000) : undefined,
        checkedOutByGuestDateTime:
          trip.checkedOutByGuestDateTime > 0 ? new Date(Number(trip.checkedOutByGuestDateTime) * 1000) : undefined,
        endFuelLevelInGal: trip.endFuelLevelInGal > 0 ? Number(trip.endFuelLevelInGal) : undefined,
        endOdometr: trip.endOdometr > 0 ? Number(trip.endOdometr) : undefined,
        checkedOutByHostDateTime:
          trip.checkedOutByHostDateTime > 0 ? new Date(Number(trip.checkedOutByHostDateTime) * 1000) : undefined,

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
    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getTrip(contract, tripId);
        }
      })
      .then((data) => {
        setTripDetails(data ?? emptyDetails);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, [tripId]);

  return [dataFetched, tripDetails] as const;
};

export default useTripDetails;
