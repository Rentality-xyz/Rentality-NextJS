import { useRentality } from "@/contexts/rentalityContext";
import { Claim } from "@/features/claims/models";
import { validateContractFullClaimInfo } from "@/model/blockchain/schemas_utils";
import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { contractFullClaimInfoToClaim } from "../models/mappers/contractFullClaimInfoToClaim";

export const CLAIMS_LIST_QUERY_KEY = "ClaimList";

type QueryData = Claim[];

function useFetchClaims(isHost: boolean) {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [CLAIMS_LIST_QUERY_KEY, isHost, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts) {
        throw new Error("Contracts not initialized");
      }

      const result = await rentalityContracts.gateway.getMyClaimsAs(isHost);

      if (!result.ok) {
        throw result.error;
      }

      if (result.value.length > 0) {
        validateContractFullClaimInfo(result.value[0]);
      }

      const claimsData = result.value.map((claimDto) => contractFullClaimInfoToClaim(claimDto, isHost));

      claimsData.sort((a, b) => {
        return b.deadlineDate.getTime() - a.deadlineDate.getTime();
      });

      return claimsData;
    },
  });

  const data = queryResult.data ?? [];
  return { ...queryResult, data: data } as DefinedUseQueryResult<QueryData, Error>;
}

export default useFetchClaims;
