import { useEffect, useState } from "react";
import { TripInfo, AllowedChangeTripAction } from "@/model/TripInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { ContractTrip, ContractTripDTO, EngineType, TripStatus } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";

const useGuestTrips = () => {
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

        let transaction = await rentalityContract.checkInByGuest(tripId, [startFuelLevelInPercents, startOdometr]);
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

        let transaction = await rentalityContract.checkOutByGuest(tripId, [endFuelLevelInPercents, endOdometr]);
        const result = await transaction.wait();
        return true;
      } catch (e) {
        console.error("checkOutTrip error:" + e);
        return false;
      }
    };

    const getAllowedActions = (tripStatus: TripStatus, trip: ContractTrip) => {
      const result: AllowedChangeTripAction[] = [];

      switch (tripStatus) {
        case TripStatus.Pending:
          result.push({
            text: "Reject",
            readonly: false,
            params: [],
            action: rejectRequest,
          });
          break;
        case TripStatus.Confirmed:
          result.push({
            text: "Reject",
            readonly: false,
            params: [],
            action: rejectRequest,
          });
          break;
        case TripStatus.CheckedInByHost:
          result.push({
            text: "Start",
            readonly: true,
            params: [
              {
                text: "Fuel or battery level, %",
                value: (Number(trip.startParamLevels[0]) / 100).toString(),
                type: "fuel",
              },
              {
                text: "Odometr",
                value: trip.startParamLevels[1].toString(),
                type: "text",
              },
            ],
            action: checkInTrip,
          });
          result.push({
            text: "Reject",
            readonly: false,
            params: [],
            action: rejectRequest,
          });
          break;
        case TripStatus.Started:
          result.push({
            text: "Finish",
            readonly: false,
            params: [
              { text: "Fuel or battery level, %", value: "", type: "fuel" },
              { text: "Odometr", value: "", type: "text" },
            ],
            action: checkOutTrip,
          });
          break;
        case TripStatus.CheckedOutByGuest:
          break;
        case TripStatus.Finished:
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
        const tripsBookedView: ContractTripDTO[] = await rentalityContract.getTripsAsGuest();

        const tripsBookedData =
          tripsBookedView.length === 0
            ? []
            : await Promise.all(
                tripsBookedView.map(async (i: ContractTripDTO, index) => {
                  if (index === 0) {
                    validateContractTripDTO(i);
                  }
                  const tripContactInfo = await rentalityContract.getTripContactInfo(i.trip.carId);

                  const meta = await getMetaDataFromIpfs(i.metadataURI);
                  const tripStatus = i.trip.status;
                  const tankSize = Number(
                    meta.attributes?.find((x: any) => x.trait_type === "Tank volume(gal)")?.value ?? "0"
                  );
                  const timeZoneId = i.timeZoneId;

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
                    allowedActions: getAllowedActions(tripStatus, i.trip),
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

export default useGuestTrips;
