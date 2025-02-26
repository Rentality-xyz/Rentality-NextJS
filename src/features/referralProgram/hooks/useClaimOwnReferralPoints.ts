import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useOwnReferralPointsSharedStore from "./useOwnReferralPointsSharedStore";
import { Err } from "@/model/utils/result";
import { REFERRAL_OWN_POINTS_QUERY_KEY } from "./useFetchOwnReferralPoints";
import { REFERRAL_USER_BALANCE_QUERY_KEY } from "./useFetchUserBalance";
import { REFERRAL_POINTS_HISTORY_QUERY_KEY } from "./useFetchPointsHistory";

function useClaimOwnReferralPoints() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();
  const setIsClaiming = useOwnReferralPointsSharedStore((state) => state.setIsClaiming);
  const setReadyToClaim = useOwnReferralPointsSharedStore((state) => state.setReadyToClaim);

  return useMutation({
    mutationFn: async () => {
      try {
        if (!rentalityContracts || !ethereumInfo) {
          console.error("claimMyPoints error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        const result = await rentalityContracts.referralProgram.claimPoints(ethereumInfo.walletAddress);

        return result.ok ? result : Err(new Error("claimMyPoints error: " + result.error));
      } catch (error) {
        console.error("claimMyPoints error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.refetchQueries({ queryKey: [REFERRAL_OWN_POINTS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [REFERRAL_POINTS_HISTORY_QUERY_KEY] });
      }
    },
    onMutate: () => {
      setIsClaiming(true);
    },
    onSettled: (data) => {
      setIsClaiming(false);
      if (!!data && data.ok) {
        setReadyToClaim(0);
      }
    },
  });
}

export default useClaimOwnReferralPoints;
