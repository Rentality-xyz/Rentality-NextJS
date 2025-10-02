import { GuestGeneralInsurance } from "@/model/GuestInsurance";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { useQuery } from "@tanstack/react-query";
import { InsuranceType } from "@/model/blockchain/schemas";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { displayMoneyWith2Digits } from "@/utils/numericFormatters";

export const HOST_INSURANCE_BALANCE_QUERY_KEY = "HostInsuranceBalance";
type QueryData = number;
const INITIAL_DATA = 0.0;

const useFetchHostInsuranceBalance = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [HOST_INSURANCE_BALANCE_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchHostInsuranceBalance(rentalityContracts),
  });

  const data = queryResult.data ?? INITIAL_DATA;
  return { ...queryResult, data: data };
};

async function fetchHostInsuranceBalance(rentalityContracts: IRentalityContracts | null | undefined) {
  if (!rentalityContracts) {
    throw new Error("Contracts not initialized");
  }

  const result = await rentalityContracts.gateway.getHostInsuranceBalance()

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return Number(result.value) / 10**18;
}

export default useFetchHostInsuranceBalance;