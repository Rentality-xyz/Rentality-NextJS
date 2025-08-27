import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { contractFullClaimInfoToClaim } from "@/features/claims/models/mappers/contractFullClaimInfoToClaim";
import { Claim } from "@/features/claims/models";

export const HOST_INSURANCE_CLAIMS_QUERY_KEY = "HostInsuranceClaims";

const useAdminHostInsuranceClaims = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<Claim[]>({
    queryKey: [HOST_INSURANCE_CLAIMS_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => await fetchHostInsuranceClaims(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });
  const data = queryResult.data ?? [];
  return { ...queryResult, data: data };
};

async function fetchHostInsuranceClaims(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getHostInsuranceClaims();

  if (!result.ok) {
    throw result.error;
  }

  return result.value.map((contractFullClaimInfo) =>
    contractFullClaimInfoToClaim(contractFullClaimInfo, true)
  );
}

export default useAdminHostInsuranceClaims;