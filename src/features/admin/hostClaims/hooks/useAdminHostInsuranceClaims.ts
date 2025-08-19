import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import {
  HostInsuranceClaim,
  mapContractFullClaimInfoToHostInsuranceClaim,
} from "@/features/admin/hostClaims/models/hostInsuranceClaim";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { HOST_INSURANCE_RULE_QUERY_KEY } from "@/hooks/host/useFetchHostInsuranceRule";
import { ContractFullClaimInfo } from "@/model/blockchain/schemas";

const useAdminHostInsuranceClaims = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<HostInsuranceClaim[]>({
    queryKey: [HOST_INSURANCE_RULE_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
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
  console.log("efrgregregi result");

  if (!result.ok) {
    throw result.error;
  }
  console.log(result.value);
  const mapped =  result.value.map((contractFullClaimInfo) =>
    mapContractFullClaimInfoToHostInsuranceClaim(contractFullClaimInfo)
  );

  console.log(mapped);

  return result.value;
}

export default useAdminHostInsuranceClaims;