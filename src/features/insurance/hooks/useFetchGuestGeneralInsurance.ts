import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { InsuranceType } from "@/model/blockchain/schemas";
import { GuestGeneralInsurance } from "@/model/GuestInsurance";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { useQuery } from "@tanstack/react-query";

export const INSURANCE_GUEST_QUERY_KEY = "InsuranceGuest";

type QueryData = GuestGeneralInsurance;

const EMPTY_GUEST_GENERAL_INSURANCE = { photo: "" };

const useFetchGuestGeneralInsurance = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();

  return useQuery<QueryData>({
    queryKey: [INSURANCE_GUEST_QUERY_KEY, ethereumInfo?.walletAddress],
    initialData: EMPTY_GUEST_GENERAL_INSURANCE,
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }

      console.debug("Fetching guest insurance");

      const result = await rentalityContracts.gatewayProxy.getMyInsurancesAsGuest();

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      if (result.value.length === 0 || result.value[result.value.length - 1].insuranceType !== InsuranceType.General) {
        return EMPTY_GUEST_GENERAL_INSURANCE;
      }

      return { photo: getIpfsURI(result.value[result.value.length - 1].photo) };
    },
    enabled: !!rentalityContracts && !!ethereumInfo?.walletAddress,
  });
};

export default useFetchGuestGeneralInsurance;
