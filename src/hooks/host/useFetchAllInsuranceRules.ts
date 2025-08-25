import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { ZeroAddress } from "ethers";

export const ALL_INSURANCE_RULES_QUERY_KEY = "AllInsuranceRules";
export type InsuranceRule = {
  partToInsurance: bigint;
  insuranceId: bigint;
};

const emptyInsuranceRule: InsuranceRule = {
  partToInsurance: BigInt(0),
  insuranceId: BigInt(0),
};

type QueryData = InsuranceRule[];

function useFetchAllInsuranceRules() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [ALL_INSURANCE_RULES_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchAllInsuranceRules(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? [emptyInsuranceRule];
  return { ...queryResult, allInsuranceRules: data };
}

async function fetchAllInsuranceRules(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getAllInsuranceRules();
  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}

export default useFetchAllInsuranceRules;
