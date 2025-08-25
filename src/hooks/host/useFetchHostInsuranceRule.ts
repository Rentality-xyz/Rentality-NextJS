import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";

export const HOST_INSURANCE_RULE_QUERY_KEY = "HostInsuranceRule";

export type HostInsuranceRule = {
  partToInsurance: bigint,
  insuranceId: bigint,
};

const emptyInsuranceRule: HostInsuranceRule = {
  partToInsurance: BigInt(0),
  insuranceId: BigInt(0),
};

type QueryData = HostInsuranceRule;

function useFetchHostInsuranceRule() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [HOST_INSURANCE_RULE_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => await fetchHostInsuranceRules(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? emptyInsuranceRule;
  return { ...queryResult, data: data };
}

async function fetchHostInsuranceRules(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getHostInsuranceRule(ethereumInfo.walletAddress);

  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}

export default useFetchHostInsuranceRule;
