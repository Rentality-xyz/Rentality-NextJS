import { useRentality } from "@/contexts/rentalityContext";
import { Err, Result } from "@/model/utils/result";
import { ONE_TIME_INSURANCE_TYPE_ID } from "@/utils/constants";
import { InsuranceType } from "@/model/blockchain/schemas";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INSURANCE_LIST_QUERY_KEY } from "./useFetchInsurances";
import { INSURANCE_GUEST_QUERY_KEY } from "./useFetchGuestGeneralInsurance";

export type SaveTripInsuranceRequest = {
  insuranceType: string;
  tripId: number;
  companyName: string;
  policeNumber: string;
  comment?: string;
};

const useSaveTripInsurance = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SaveTripInsuranceRequest): Promise<Result<boolean, Error>> => {
      if (!rentalityContracts || !ethereumInfo) {
        console.error("saveGuestTripInsurance error: Missing required contracts or ethereum info");
        return Err(new Error("Missing required contracts or ethereum info"));
      }

      const { insuranceType, tripId, companyName, policeNumber, comment } = request;

      if (insuranceType !== ONE_TIME_INSURANCE_TYPE_ID) {
        return Err(new Error("You can add only one-time insurance for trip"));
      }

      if (tripId === undefined) return Err(new Error("tripId is undefined"));
      if (companyName === undefined) return Err(new Error("companyName is undefined"));
      if (policeNumber === undefined) return Err(new Error("policeNumber is undefined"));

      try {
        const result = await rentalityContracts.gatewayProxy.saveTripInsuranceInfo(BigInt(tripId), {
          insuranceType: InsuranceType.OneTime,
          photo: "",
          companyName: companyName,
          policyNumber: policeNumber,
          comment: comment ?? "",
        });
        return result.ok ? result : Err(new Error("saveTripInsurance error: " + result.error));
      } catch (error) {
        console.error("saveTripInsurance error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INSURANCE_GUEST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INSURANCE_LIST_QUERY_KEY] });
    },
  });
};

export default useSaveTripInsurance;
