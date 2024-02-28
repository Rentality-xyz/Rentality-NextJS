import { useEffect, useState } from "react";
import { ContractTrip, validateContractTrip } from "@/model/blockchain/ContractTrip";
import { TripInfo, AllowedChangeTripAction, TripStatus } from "@/model/TripInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTime } from "@/utils/formInput";
import { EngineType } from "@/model/EngineType";

const useHostTrips = () => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<Boolean>(true);
  const [tripsBooked, setTripsBooked] = useState<TripInfo[]>([]);
  const [tripsHistory, setTripsHistory] = useState<TripInfo[]>([]);

  const updateData = () => {
    setUpdateRequired(true);
  };

  const isTripBooked = (status: TripStatus) => {
    return status !== TripStatus.Rejected && status !== TripStatus.Closed;
  };

  useEffect(() => {
    const acceptRequest = async (tripId: bigint, params: string[]) => {
      if (!rentalityContract) {
        console.error("acceptRequest error: rentalityContract is null");
        return false;
      }

      try {
        let transaction = await rentalityContract.approveTripRequest(tripId);
        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("acceptRequest error:" + e);
        return false;
      }
    };

    const rejectRequest = async (tripId: bigint, params: string[]) => {
      if (!rentalityContract) {
        console.error("rejectRequest error: rentalityContract is null");
        return false;
      }

      try {
        let transaction = await rentalityContract.rejectTripRequest(tripId);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("rejectRequest error:" + e);
        return false;
      }
    };

    const checkInTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityContract) {
        console.error("checkInTrip error: rentalityContract is null");
        return false;
      }

      try {
        const startFuelLevelInPercents = BigInt(Number(params[0]) * 100);
        const startOdometr = BigInt(params[1]);

        let transaction = await rentalityContract.checkInByHost(tripId, [startFuelLevelInPercents, startOdometr]);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("checkInTrip error:" + e);
        return false;
      }
    };

    const checkOutTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityContract) {
        console.error("checkOutTrip error: rentalityContract is null");
        return false;
      }

      try {
        const endFuelLevelInPercents = BigInt(Number(params[0]) * 100);
        const endOdometr = BigInt(params[1]);

        let transaction = await rentalityContract.checkOutByHost(tripId, [endFuelLevelInPercents, endOdometr]);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("checkOutTrip error:" + e);
        return false;
      }
    };

    const finishTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityContract) {
        console.error("finishTrip error: rentalityContract is null");
        return false;
      }

      try {
        let transaction = await rentalityContract.finishTrip(tripId);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("finishTrip error" + e);
        return false;
      }
    };

    const getAllowedActions = (tripStatus: TripStatus, trip: ContractTrip) => {
      const result: AllowedChangeTripAction[] = [];

      switch (tripStatus) {
        case TripStatus.Pending:
          result.push({
            text: "Confirm",
            readonly: false,
            params: [],
            action: acceptRequest,
          });
          result.push({
            text: "Reject",
            readonly: false,
            params: [],
            action: rejectRequest,
          });
          break;
        case TripStatus.Confirmed:
          result.push({
            text: "Start",
            readonly: false,
            params: [
              { text: "Fuel or battery level, %", value: "", type: "fuel" },
              { text: "Odometr", value: "", type: "text" },
            ],
            action: checkInTrip,
          });
          break;
        case TripStatus.CheckedInByHost:
          break;
        case TripStatus.Started:
          break;
        case TripStatus.CheckedOutByGuest:
          result.push({
            text: "Finish",
            readonly: true,
            params: [
              {
                text: "Fuel or battery level, %",
                value: (Number(trip.endParamLevels[0]) / 100).toString(),
                type: "fuel",
              },
              {
                text: "Odometr",
                value: trip.endParamLevels[1].toString(),
                type: "text",
              },
            ],
            action: checkOutTrip,
          });
          break;
        case TripStatus.Finished:
          result.push({
            text: "Complete",
            readonly: false,
            params: [],
            action: finishTrip,
          });
          break;
        case TripStatus.Closed:
          break;
        case TripStatus.Rejected:
        default:
          break;
      }
      return result;
    };

    const getTrips = async (rentalityContract: IRentalityContract) => {
      try {
        if (rentalityContract == null) {
          console.error("getTrips error: contract is null");
          return;
        }
        const tripsBookedView: ContractTrip[] = await rentalityContract.getTripsAsHost();

        const tripsBookedData =
          tripsBookedView.length === 0
            ? []
            : await Promise.all(
                tripsBookedView.map(async (i: ContractTrip, index) => {
                  if (index === 0) {
                    validateContractTrip(i);
                  }

                  const tokenURI = await rentalityContract.getCarMetadataURI(i.carId);
                  const tripContactInfo = await rentalityContract.getTripContactInfo(i.carId);
                  const meta = await getMetaDataFromIpfs(tokenURI);
                  const tripStatus = i.status;
                  const tankSize = Number(
                    meta.attributes?.find((x: any) => x.trait_type === "Tank volume(gal)")?.value ?? "0"
                  );

                  let item: TripInfo = {
                    tripId: Number(i.tripId),
                    carId: Number(i.carId),
                    image: getIpfsURIfromPinata(meta.image),
                    brand: meta.attributes?.find((x: any) => x.trait_type === "Brand")?.value ?? "",
                    model: meta.attributes?.find((x: any) => x.trait_type === "Model")?.value ?? "",
                    year: meta.attributes?.find((x: any) => x.trait_type === "Release year")?.value ?? "",
                    licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
                    tripStart: getDateFromBlockchainTime(i.startDateTime),
                    tripEnd: getDateFromBlockchainTime(i.endDateTime),
                    locationStart: i.startLocation,
                    locationEnd: i.endLocation,
                    status: tripStatus,
                    allowedActions: getAllowedActions(tripStatus, i),
                    totalPrice: (Number(i.paymentInfo.totalDayPriceInUsdCents) / 100).toString(),
                    tankVolumeInGal: tankSize,
                    startFuelLevelInPercents: Number(i.startParamLevels[0]),
                    endFuelLevelInPercents: Number(i.endParamLevels[0]),
                    engineType: i.fuelPrices.length === 4 ? EngineType.ELECTRIC : EngineType.PATROL,
                    fuelPricePerGal: i.fuelPrices.length === 1 ? Number(i.fuelPrices[0]) / 100 : 0,
                    batteryPrices:
                      i.fuelPrices.length === 4
                        ? {
                            price_0_20: Number(i.fuelPrices[0]) / 100,
                            price_21_50: Number(i.fuelPrices[1]) / 100,
                            price_51_80: Number(i.fuelPrices[2]) / 100,
                            price_81_100: Number(i.fuelPrices[3]) / 100,
                          }
                        : { price_0_20: 0, price_21_50: 0, price_51_80: 0, price_81_100: 0 },
                    milesIncludedPerDay: Number(i.milesIncludedPerDay),
                    startOdometr: Number(i.startParamLevels[1]),
                    endOdometr: Number(i.endParamLevels[1]),
                    depositPaid: Number(i.paymentInfo.depositInUsdCents) / 100,
                    overmilePrice: Number(i.pricePerDayInUsdCents) / Number(i.milesIncludedPerDay) / 100,
                    hostPhoneNumber: formatPhoneNumber(tripContactInfo.hostPhoneNumber),
                    guestPhoneNumber: formatPhoneNumber(tripContactInfo.guestPhoneNumber),
                    hostAddress: i.host,
                    hostName: i.hostName,
                    guestAddress: i.guest,
                    guestName: i.guestName,
                    rejectedBy: i.rejectedBy,
                    rejectedDate: i.rejectedDateTime > 0 ? getDateFromBlockchainTime(i.rejectedDateTime) : undefined,
                    createdDateTime: getDateFromBlockchainTime(i.createdDateTime),
                    checkedInByHostDateTime: getDateFromBlockchainTime(i.checkedInByHostDateTime),
                    checkedOutByGuestDateTime: getDateFromBlockchainTime(i.checkedOutByGuestDateTime),
                    checkedOutByHostDateTime: getDateFromBlockchainTime(i.checkedOutByHostDateTime),
                    hostPhotoUrl: i.hostPhotoUrl,
                    guestPhotoUrl: i.guestPhotoUrl,
                  };
                  return item;
                })
              );

        return tripsBookedData;
      } catch (e) {
        console.error("getTrips error:" + e);
      }
    };

    if (!updateRequired) return;
    if (!rentalityContract) return;

    setUpdateRequired(false);
    setIsLoading(true);

    getTrips(rentalityContract)
      .then((data) => {
        setTripsBooked(
          data
            ?.filter((i) => {
              return isTripBooked(i.status);
            })
            .reverse() ?? []
        );
        setTripsHistory(
          data
            ?.filter((i) => {
              return !isTripBooked(i.status);
            })
            .reverse() ?? []
        );
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [updateRequired, rentalityContract]);

  return [isLoading, tripsBooked, tripsHistory, updateData] as const;
};

export default useHostTrips;
