import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { InsuranceType } from "@/model/blockchain/schemas";
import { GuestGeneralInsurance } from "@/model/GuestInsurance";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { useQuery } from "@tanstack/react-query";

export const INSURANCE_GUEST_QUERY_KEY = "InsuranceGuest";
type QueryData = GuestGeneralInsurance;
const INITIAL_DATA = { photo: "" };

const useFetchGuestGeneralInsurance = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [INSURANCE_GUEST_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchGuestGeneralInsurance(rentalityContracts),
  });

  const data = queryResult.data ?? INITIAL_DATA;
  return { ...queryResult, data: data };
};

async function fetchGuestGeneralInsurance(rentalityContracts: IRentalityContracts | null | undefined) {
  if (!rentalityContracts) {
    throw new Error("Contracts not initialized");
  }

  const result = await rentalityContracts.gateway.getMyInsurancesAsGuest();

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  if (result.value.length === 0 || result.value[result.value.length - 1].insuranceType !== InsuranceType.General) {
    return INITIAL_DATA;
  }

  return { photo: getIpfsURI(result.value[result.value.length - 1].photo) };
}

export default useFetchGuestGeneralInsurance;
