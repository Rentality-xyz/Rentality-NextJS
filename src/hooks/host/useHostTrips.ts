import { useEffect, useState } from "react";
import { TripInfo, AllowedChangeTripAction } from "@/model/TripInfo";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { ContractTrip, ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";
import { logger } from "@/utils/logger";

const useHostTrips = () => {
  const { rentalityContracts } = useRentality();
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
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
      if (!rentalityContracts) {
        logger.error("acceptRequest error: rentalityContract is null");
        return false;
      }

      try {
        const result = await rentalityContracts.gateway.approveTripRequest(tripId);
        if (!result.ok) {
          logger.error("acceptRequest error:" + result.error);
          return false;
        }
        return true;
      } catch (error) {
        logger.error("acceptRequest error:" + error);
        return false;
      }
    };

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
        const insuranceCompany = params[2];
        const insuranceNumber = params[3];

        const result = await rentalityContracts.gateway.checkInByHost(
          tripId,
          [startFuelLevelInPercents, startOdometr],
          insuranceCompany,
          insuranceNumber
        );
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

        const result = await rentalityContracts.gateway.checkOutByHost(tripId, [endFuelLevelInPercents, endOdometr]);
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

    const finishTrip = async (tripId: bigint, params: string[]) => {
      if (!rentalityContracts) {
        logger.error("finishTrip error: rentalityContract is null");
        return false;
      }

      try {
        const result = await rentalityContracts.gateway.finishTrip(tripId);
        if (!result.ok) {
          logger.error("finishTrip error:" + result.error);
          return false;
        }
        return true;
      } catch (error) {
        logger.error("finishTrip error" + error);
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

    const getTrips = async (rentalityContracts: IRentalityContracts) => {
      try {
        if (!rentalityContracts) {
          logger.error("getTrips error: contract is null");
          return;
        }
        const result = await rentalityContracts.gateway.getTripsAs(true);

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
                  const item = await mapTripDTOtoTripInfo(tripDto);
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

  return [isLoadingTrips, tripsBooked, tripsHistory, updateData] as const;
};

export default useHostTrips;
