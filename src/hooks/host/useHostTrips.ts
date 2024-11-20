import { useEffect, useState } from "react";
import { TripInfo, AllowedChangeTripAction } from "@/model/TripInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractTrip, ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";

const useHostTrips = () => {
  const rentalityContract = useRentality();
  const [isLoadingTrips, setIsLoadingTrips] = useState<Boolean>(true);
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
        const transaction = await rentalityContract.approveTripRequest(tripId);
        await transaction.wait();
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
        const transaction = await rentalityContract.rejectTripRequest(tripId);
        await transaction.wait();
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
        const insuranceCompany = params[2];
        const insuranceNumber = params[3];

        const transaction = await rentalityContract.checkInByHost(
          tripId,
          [startFuelLevelInPercents, startOdometr],
          insuranceCompany,
          insuranceNumber
        );
        await transaction.wait();
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

        const transaction = await rentalityContract.checkOutByHost(tripId, [endFuelLevelInPercents, endOdometr]);
        await transaction.wait();
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
        const transaction = await rentalityContract.finishTrip(tripId);
        await transaction.wait();
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
            isDisplay: true,
            params: [],
            action: acceptRequest,
          });
          result.push({
            text: "Reject",
            readonly: false,
            isDisplay: true,
            params: [],
            action: rejectRequest,
          });
          break;
        case TripStatus.Confirmed:
          result.push({
            text: "Start",
            readonly: false,
            isDisplay: true,
            params: [
              { text: "Fuel or battery level, %", value: "", type: "fuel", required: true },
              { text: "Odometer", value: "", type: "text", required: true },
              { text: "Insurance company name", value: "", type: "text", required: false },
              { text: "Insurance policy number", value: "", type: "text", required: false },
            ],
            action: checkInTrip,
          });
          result.push({
            text: "Reject",
            readonly: false,
            isDisplay: true,
            params: [],
            action: rejectRequest,
          });
          break;
        case TripStatus.CheckedInByHost:
          result.push({
            text: "Finish",
            readonly: false,
            isDisplay: false,
            params: [
              { text: "Fuel or battery level, %", value: "", type: "fuel", required: true },
              { text: "Odometer", value: "", type: "text", required: true },
            ],
            action: checkOutTrip,
          });
          break;
        case TripStatus.Started:
          result.push({
            text: "Finish",
            readonly: false,
            isDisplay: false,
            params: [
              { text: "Fuel or battery level, %", value: "", type: "fuel", required: true },
              { text: "Odometer", value: "", type: "text", required: true },
            ],
            action: checkOutTrip,
          });
          break;
        case TripStatus.CheckedOutByGuest:
          result.push({
            text: "Finish",
            readonly: true,
            isDisplay: true,
            params: [
              {
                text: "Fuel or battery level, %",
                value: (Number(trip.endParamLevels[0]) / 100).toString(),
                type: "fuel",
                required: true,
              },
              {
                text: "Odometer",
                value: trip.endParamLevels[1].toString(),
                type: "text",
                required: true,
              },
            ],
            action: checkOutTrip,
          });
          break;
        case TripStatus.CompletedWithoutGuestComfirmation:
          result.push({
            text: "Contact guest",
            readonly: false,
            isDisplay: false,
            params: [],
            action: async (tripId: bigint, params: string[]) => {
              return false;
            },
          });
          break;
        case TripStatus.Finished:
          result.push({
            text: "Complete",
            readonly: false,
            isDisplay: true,
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
        const tripsBookedView: ContractTripDTO[] = await rentalityContract.getTripsAs(true);

        const tripsBookedData =
          tripsBookedView.length === 0
            ? []
            : await Promise.all(
                tripsBookedView.map(async (i: ContractTripDTO, index) => {
                  if (index === 0) {
                    validateContractTripDTO(i);
                  }

                  const item = await mapTripDTOtoTripInfo(i);
                  item.allowedActions = getAllowedActions(item.status, i.trip);

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
    setIsLoadingTrips(true);

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
        setIsLoadingTrips(false);
      })
      .catch(() => setIsLoadingTrips(false));
  }, [updateRequired, rentalityContract]);

  return [isLoadingTrips, tripsBooked, tripsHistory, updateData] as const;
};

export default useHostTrips;
