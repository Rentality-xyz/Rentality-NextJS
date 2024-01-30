import { useEffect, useState } from "react";
import { ContractTrip, getTripStatusFromContract, validateContractTrip } from "@/model/blockchain/ContractTrip";
import { TripInfo, AllowedChangeTripAction, TripStatus } from "@/model/TripInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { getDateFromBlockchainTime } from "@/utils/formInput";

const useHostTrips = () => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [updateRequired, setUpdateRequired] = useState<Boolean>(true);
  const [tripsBooked, setTripsBooked] = useState<TripInfo[]>([]);
  const [tripsHistory, setTripsHistory] = useState<TripInfo[]>([]);

  const updateData = () => {
    setUpdateRequired(true);
  };

  const convernFuelInLevel = (fuelLevelInGal: bigint, fuelTank: number) => {
    const levelInPercents = Math.ceil((8 * Number(fuelLevelInGal)) / fuelTank) * 0.125;
    return levelInPercents.toString();
  };

  const isTripBooked = (status: TripStatus) => {
    return status !== TripStatus.Rejected && status !== TripStatus.Closed;
  };

  useEffect(() => {
    const acceptRequest = async (tripId: bigint, params: string[]) => {
      if (!rentalityInfo) {
        console.error("acceptRequest error: rentalityInfo is null");
        return false;
      }

      try {
        let transaction = await rentalityInfo.rentalityContract.approveTripRequest(tripId);
        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("acceptRequest error:" + e);
        return false;
      }
    };

    const rejectRequest = async (tripId: bigint, params: string[]) => {
      if (!rentalityInfo) {
        console.error("rejectRequest error: rentalityInfo is null");
        return false;
      }

      try {
        let transaction = await rentalityInfo.rentalityContract.rejectTripRequest(tripId);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("rejectRequest error:" + e);
        return false;
      }
    };

    const checkInTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityInfo) {
        console.error("checkInTrip error: rentalityInfo is null");
        return false;
      }

      try {
        const startFuelLevelInPermille = BigInt(Number(params[0]) * 1000);
        const startOdometr = BigInt(params[1]);

        let transaction = await rentalityInfo.rentalityContract.checkInByHost(tripId, [
          startFuelLevelInPermille,
          startOdometr,
        ]);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("checkInTrip error:" + e);
        return false;
      }
    };

    const checkOutTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityInfo) {
        console.error("checkOutTrip error: rentalityInfo is null");
        return false;
      }

      try {
        const endFuelLevelInPermille = BigInt(Number(params[0]) * 1000);
        const endOdometr = BigInt(params[1]);

        let transaction = await rentalityInfo.rentalityContract.checkOutByHost(tripId, [
          endFuelLevelInPermille,
          endOdometr,
        ]);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("checkOutTrip error:" + e);
        return false;
      }
    };

    const finishTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityInfo) {
        console.error("finishTrip error: rentalityInfo is null");
        return false;
      }

      try {
        let transaction = await rentalityInfo.rentalityContract.finishTrip(tripId);

        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("finishTrip error" + e);
        return false;
      }
    };

    const getAllowedActions = (tripStatus: TripStatus, trip: ContractTrip, tankSize: number) => {
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
                value: convernFuelInLevel(trip.endParamLevels[0], tankSize),
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
                    allowedActions: getAllowedActions(tripStatus, i, tankSize),
                    totalPrice: (Number(i.paymentInfo.totalDayPriceInUsdCents) / 100).toString(),
                    tankVolumeInGal: tankSize,
                    startFuelLevelInGal: Number(i.startParamLevels[0]),
                    endFuelLevelInGal: Number(i.endParamLevels[0]),
                    fuelPricePerGal: Number(i.fuelPrices[0]) / 100,
                    milesIncludedPerDay: Number(i.milesIncludedPerDay),
                    startOdometr: Number(i.startParamLevels[1]),
                    endOdometr: Number(i.endParamLevels[1]),
                    depositPaid: Number(i.paymentInfo.depositInUsdCents) / 100,
                    overmilePrice: Number(i.pricePerDayInUsdCents) / Number(i.milesIncludedPerDay) / 100,
                    hostMobileNumber: tripContactInfo.hostPhoneNumber,
                    guestMobileNumber: tripContactInfo.guestPhoneNumber,
                    hostAddress: i.host,
                    hostName: i.hostName,
                    guestAddress: i.guest,
                    guestName: i.guestName,
                    rejectedBy: i.rejectedBy,
                    rejectedDate: i.rejectedDateTime > 0 ? getDateFromBlockchainTime(i.rejectedDateTime) : undefined,
                    createdDateTime: getDateFromBlockchainTime(i.createdDateTime),
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
    if (!rentalityInfo) return;

    setUpdateRequired(false);
    setDataFetched(false);

    getTrips(rentalityInfo.rentalityContract)
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
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, [updateRequired, rentalityInfo]);

  return [dataFetched, tripsBooked, tripsHistory, updateData] as const;
};

export default useHostTrips;
