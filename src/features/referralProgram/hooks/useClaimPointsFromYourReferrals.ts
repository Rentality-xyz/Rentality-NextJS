import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err } from "@/model/utils/result";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REFERRAL_POINTS_FROM_YOUR_REFERRALS_QUERY_KEY } from "./useFetchPointsFromYourReferrals";
import { REFERRAL_USER_BALANCE_QUERY_KEY } from "./useFetchUserBalance";
import { REFERRAL_POINTS_HISTORY_QUERY_KEY } from "./useFetchPointsHistory";

function useClaimPointsFromYourReferrals() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        if (!rentalityContracts || !ethereumInfo) {
          console.error("claimPoints error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        const result = await rentalityContracts.referralProgram.claimRefferalPoints(ethereumInfo.walletAddress);

        return result.ok ? result : Err(new Error("claimMyPoints error: " + result.error));
      } catch (error) {
        console.error("claimPoints error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [REFERRAL_POINTS_FROM_YOUR_REFERRALS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [REFERRAL_POINTS_HISTORY_QUERY_KEY] });
      }
    },
  });
}

export default useClaimPointsFromYourReferrals;
