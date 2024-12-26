import { useEffect, useState } from "react";
import { TripInfo, AllowedChangeTripAction } from "@/model/TripInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractTrip, ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";
import { ZERO_HASH } from "@/utils/wallet";

const useGuestTrips = () => {
  const rentalityContract = useRentality();
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [tripsBooked, setTripsBooked] = useState<TripInfo[]>([]);
  const [tripsHistory, setTripsHistory] = useState<TripInfo[]>([]);

  const updateData = () => {
    setUpdateRequired(true);
  };

  const confirmCarDetails = async (tripId: number) => {
    if (!rentalityContract) {
      console.error("confirmCarDetails error: rentalityContract is null");
      return false;
    }

    try {
      console.log(`confirmCarDetails error: logic in development`);
      //const transaction = await rentalityContract.confirmCarDetails(BigInt(tripId));
      //await transaction.wait();
      return true;
    } catch (e) {
      console.error("confirmCarDetails error:" + e);
      return false;
    }
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

        let transaction = await rentalityContract.checkInByGuest(tripId, [startFuelLevelInPercents, startOdometr]);
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
        /// TODO: get from input
        let transaction = await rentalityContract.checkOutByGuest(
          tripId,
          [endFuelLevelInPercents, endOdometr],
          ZERO_HASH
        );
        await transaction.wait();
        return true;
      } catch (e) {
        console.error("checkOutTrip error:" + e);
        return false;
      }
    };

    const confirmCheckOutTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityContract) {
        console.error("confirmCheckOutTrip error: rentalityContract is null");
        return false;
      }

      try {
        /// TODO: get from input
        let transaction = await rentalityContract.confirmCheckOut(tripId, ZERO_HASH);
        await transaction.wait();
        return true;
      } catch (e) {
        console.error("confirmCheckOutTrip error:" + e);
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
            isDisplay: true,
            params: [],
            action: rejectRequest,
          });
          break;
        case TripStatus.Confirmed:
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
            text: "Start",
            readonly: true,
            isDisplay: true,
            params: [
              {
                text: "Fuel or battery level, %",
                value: (Number(trip.startParamLevels[0]) / 100).toString(),
                type: "fuel",
                required: true,
              },
              {
                text: "Odometer",
                value: trip.startParamLevels[1].toString(),
                type: "text",
                required: true,
              },
            ],
            action: checkInTrip,
          });
          break;
        case TripStatus.Started:
          result.push({
            text: "Finish",
            readonly: false,
            isDisplay: true,
            params: [
              { text: "Fuel or battery level, %", value: "", type: "fuel", required: true },
              { text: "Odometer", value: "", type: "text", required: true },
            ],
            action: checkOutTrip,
          });
          break;
        case TripStatus.CheckedOutByGuest:
          break;
        case TripStatus.CompletedWithoutGuestComfirmation:
          result.push({
            text: "Comfirm",
            readonly: false,
            isDisplay: false,
            params: [],
            action: confirmCheckOutTrip,
          });
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
        const tripsBookedView: ContractTripDTO[] = await rentalityContract.getTripsAs(false);

        const tripsBookedData =
          tripsBookedView.length === 0
            ? []
            : await Promise.all(
                tripsBookedView.map(async (i: ContractTripDTO, index) => {
                  if (index === 0) {
                    validateContractTripDTO(i);
                  }

                  let isCarDetailsConfirmed = false;
                  // try {
                  //   isCarDetailsConfirmed = await rentalityContract.isCarDetailsConfirmed(i.trip.carId);
                  // } catch (ex) {}

                  const item = await mapTripDTOtoTripInfo(i, isCarDetailsConfirmed);
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

  return { isLoadingTrips, tripsBooked, tripsHistory, updateData, confirmCarDetails } as const;
};

export default useGuestTrips;
