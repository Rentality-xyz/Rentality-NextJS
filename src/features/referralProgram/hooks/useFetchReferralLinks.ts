import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";
import { useQuery } from "@tanstack/react-query";

export const REFERRAL_LINKS_QUERY_KEY = "ReferralLinks";
type QueryData = { inviteHash: string; usedInviteHash: string };

const useFetchReferralLinks = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_LINKS_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchReferralLinks(rentalityContracts),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? { inviteHash: "", usedInviteHash: "" };
  return { ...queryResult, data: data };
};

async function fetchReferralLinks(rentalityContracts: IRentalityContracts | null | undefined) {
  if (!rentalityContracts) {
    throw new Error("Contracts not initialized");
  }

  const result = await rentalityContracts.gateway.getMyRefferalInfo();

  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return {
    inviteHash: result.value.myHash !== ZERO_4_BYTES_HASH ? result.value.myHash : "",
    usedInviteHash: result.value.savedHash !== ZERO_4_BYTES_HASH ? result.value.savedHash : "",
  };
}

export default useFetchReferralLinks;
