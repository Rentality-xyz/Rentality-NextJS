import { useRentality } from "@/contexts/rentalityContext";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractTripDTO, TripStatus } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { TripInfoForClaimCreation } from "@/features/claims/models/CreateClaimRequest";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { useTranslation } from "react-i18next";
import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query";

export const TRIPS_FOR_CLAIM_CREATION_QUERY_KEY = "TripsForClaimCreation";

type QueryData = TripInfoForClaimCreation[];

const useTripsForClaimCreation = (isHost: boolean) => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { t } = useTranslation();

  const queryResult = useQuery<QueryData>({
    queryKey: [TRIPS_FOR_CLAIM_CREATION_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts) {
        throw new Error("Contracts not initialized");
      }

      const result = await rentalityContracts.gateway.getTripsAs(isHost);
      if (!result.ok) {
        throw result.error;
      }

      if (result.value.length > 0) {
        validateContractTripDTO(result.value[0]);
      }

      const tripsForClaimCreation: TripInfoForClaimCreation[] = result.value
        .filter((i) => i.trip.status !== TripStatus.Pending && i.trip.status !== TripStatus.Rejected)
        .map((dto: ContractTripDTO) => {
          const tripStart = getDateFromBlockchainTimeWithTZ(dto.trip.startDateTime, dto.timeZoneId);
          const tripEnd = getDateFromBlockchainTimeWithTZ(dto.trip.endDateTime, dto.timeZoneId);

          return {
            tripId: Number(dto.trip.tripId),
            guestAddress: dto.trip.guest,
            tripDescription: `${dto.brand} ${dto.model} ${dto.yearOfProduction} ${dto.trip.guestName} trip ${dateRangeFormatShortMonthDateYear(
              tripStart,
              tripEnd,
              dto.timeZoneId
            )}`,
            tripStart: tripStart,
          };
        });

      tripsForClaimCreation.sort((a, b) => {
        return b.tripStart.getTime() - a.tripStart.getTime();
      });
      return tripsForClaimCreation;
    },
  });

  const data = queryResult.data ?? [
    { tripId: 0, guestAddress: "", tripDescription: t("common.info.loading"), tripStart: new Date() },
  ];
  return { ...queryResult, data: data } as DefinedUseQueryResult<QueryData, Error>;
};

export default useTripsForClaimCreation;
