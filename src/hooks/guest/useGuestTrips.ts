import { useEffect, useState } from "react";
import { TripInfo, AllowedChangeTripAction } from "@/model/TripInfo";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { ContractTrip, TripStatus } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";
import { logger } from "@/utils/logger";

const useGuestTrips = () => {
  const { rentalityContracts } = useRentality();
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [tripsBooked, setTripsBooked] = useState<TripInfo[]>([]);
  const [tripsHistory, setTripsHistory] = useState<TripInfo[]>([]);

  const updateData = () => {
    setUpdateRequired(true);
  };

  const confirmCarDetails = async (tripId: number) => {
    if (!rentalityContracts) {
      logger.error("confirmCarDetails error: rentalityContract is null");
      return false;
    }

    try {
      logger.info(`confirmCarDetails error: logic in development`);
      //const transaction = await rentalityContract.confirmCarDetails(BigInt(tripId));
      //await transaction.wait();
      return true;
    } catch (error) {
      logger.error("confirmCarDetails error:" + error);
      return false;
    }
  };

  const isTripBooked = (status: TripStatus) => {
    return status !== TripStatus.Rejected && status !== TripStatus.Closed;
  };

  useEffect(() => {
    const rejectRequest = async (tripId: bigint, params: string[]) => {
      if (!rentalityContracts) {
        logger.error("rejectRequest error: rentalityContract is null");
        return false;
      }

      try {
        const result = await rentalityContracts.gateway.rejectTripRequest(tripId);
        if (!result.ok) {
          logger.error("rejectRequest error:" + result.error);
          return false;
        }
        return true;
      } catch (error) {
        logger.error("rejectRequest error:" + error);
        return false;
      }
    };

    const checkInTrip = async (tripId: bigint, params: string[], tripPhotosUrls: string[]) => {
      if (!rentalityContracts) {
        logger.error("checkInTrip error: rentalityContract is null");
        return false;
      }

      try {
        const startFuelLevelInPercents = BigInt(Number(params[0]) * 100);
        const startOdometr = BigInt(params[1]);

        const result = await rentalityContracts.gateway.checkInByGuest(tripId, [
          startFuelLevelInPercents,
          startOdometr,
        ]);
        if (!result.ok) {
          logger.error("checkInTrip error:" + result.error);
          return false;
        }

        return true;
      } catch (error) {
        logger.error("checkInTrip error:" + error);
        return false;
      }
    };

    const checkOutTrip = async (tripId: bigint, params: string[], tripPhotosUrls: string[]) => {
      if (!rentalityContracts) {
        logger.error("checkOutTrip error: rentalityContract is null");
        return false;
      }

      try {
        const endFuelLevelInPercents = BigInt(Number(params[0]) * 100);
        const endOdometr = BigInt(params[1]);

        const result = await rentalityContracts.gateway.checkOutByGuest(tripId, [endFuelLevelInPercents, endOdometr]);
        if (!result.ok) {
          logger.error("checkOutTrip error:" + result.error);
          return false;
        }

        return true;
      } catch (error) {
        logger.error("checkOutTrip error:" + error);
        return false;
      }
    };

    const confirmCheckOutTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityContracts) {
        logger.error("confirmCheckOutTrip error: rentalityContract is null");
        return false;
      }

      try {
        /// TODO: get from input
        let result = await rentalityContracts.gateway.confirmCheckOut(tripId);
        if (!result.ok) {
          logger.error("confirmCheckOutTrip error:" + result.error);
          return false;
        }
        return true;
      } catch (error) {
        logger.error("confirmCheckOutTrip error:" + error);
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
            isDisplay: false,
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

    const getTrips = async (rentalityContracts: IRentalityContracts) => {
      try {
        if (!rentalityContracts) {
          logger.error("getTrips error: contract is null");
          return;
        }
        const result = await rentalityContracts.gateway.getTripsAs(false);

        if (!result.ok) {
          logger.error("getTrips error:" + result.error);
          return;
        }
        if (result.value.length > 0) {
          validateContractTripDTO(result.value[0]);
        }

        const tripsBookedData =
          result.value.length === 0
            ? []
            : await Promise.all(
                result.value.map(async (tripDto) => {
                  const item = await mapTripDTOtoTripInfo(tripDto, false);
                  item.allowedActions = getAllowedActions(item.status, tripDto.trip);

                  return item;
                })
              );

        return tripsBookedData;
      } catch (error) {
        logger.error("getTrips error:" + error);
      }
    };

    if (!updateRequired) return;
    if (!rentalityContracts) return;

    setUpdateRequired(false);
    setIsLoadingTrips(true);

    getTrips(rentalityContracts)
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
  }, [updateRequired, rentalityContracts]);

  return { isLoadingTrips, tripsBooked, tripsHistory, updateData, confirmCarDetails } as const;
};

export default useGuestTrips;
