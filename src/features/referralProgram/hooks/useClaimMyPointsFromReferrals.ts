import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { useRentality } from "@/contexts/rentalityContext";
import { create } from "zustand";
import { useCallback, useEffect } from "react";

interface ClaimMyPointsFromReferralsState {
  isLoading: boolean;
  readyToClaim: number;
  setReadyToClaim: (value: number) => void;
  setLoadingState: () => void;
}

const useClaimMyPointsFromReferralsStore = create<ClaimMyPointsFromReferralsState>((set) => ({
  isLoading: true,
  readyToClaim: 0,
  setReadyToClaim: (value) => set({ readyToClaim: value, isLoading: false }),
  setLoadingState: () => set({ isLoading: true }),
}));

function useClaimMyPointsFromReferralsContractActions() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const fetchReadyToClaim = useCallback(async (): Promise<Result<number, Error>> => {
    try {
      if (!rentalityContracts || !ethereumInfo) {
        return Err(new Error("Missing required contracts or ethereum info"));
      }

      const result = await rentalityContracts.referralProgram.getReadyToClaimFromRefferalHash(
        ethereumInfo.walletAddress
      );

      return result.ok ? Ok(Number(result.value.totalPoints)) : Err(new Error(`Fetch error: ${result.error}`));
    } catch (error) {
      console.error("fetchReadyToClaim error: ", error);
      return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
    }
  }, [rentalityContracts, ethereumInfo]);

  const claimMyPoints = useCallback(async (): Promise<Result<boolean, Error>> => {
    try {
      if (!rentalityContracts || !ethereumInfo) {
        console.error("claimMyPoints error: Missing required contracts or ethereum info");
        return Err(new Error("Missing required contracts or ethereum info"));
      }

      const result = await rentalityContracts.referralProgram.claimRefferalPoints(ethereumInfo.walletAddress);

      return result.ok ? result : Err(new Error("claimMyPoints error: " + result.error));
    } catch (error) {
      console.error("claimMyPoints error: ", error);
      return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
    }
  }, [ethereumInfo, rentalityContracts]);

  return { fetchReadyToClaim, claimMyPoints } as const;
}

function useClaimMyPointsFromReferrals() {
  const isLoading = useClaimMyPointsFromReferralsStore((state) => state.isLoading);
  const readyToClaim = useClaimMyPointsFromReferralsStore((state) => state.readyToClaim);
  const setReadyToClaim = useClaimMyPointsFromReferralsStore((state) => state.setReadyToClaim);
  const setLoadingState = useClaimMyPointsFromReferralsStore((state) => state.setLoadingState);
  const { fetchReadyToClaim, claimMyPoints } = useClaimMyPointsFromReferralsContractActions();

  const claimMyPointsImpl = useCallback(async () => {
    setLoadingState();

    const claimResult = await claimMyPoints();

    if (!claimResult.ok) {
      setReadyToClaim(readyToClaim);
      return claimResult;
    }

    const fetchResult = await fetchReadyToClaim();

    if (fetchResult.ok) {
      setReadyToClaim(fetchResult.value);
    }

    return claimResult;
  }, [claimMyPoints, fetchReadyToClaim, setReadyToClaim, setLoadingState, readyToClaim]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetchReadyToClaim();

      if (result.ok) {
        setReadyToClaim(result.value);
      }
    };

    fetchData();
  }, [fetchReadyToClaim, setReadyToClaim]);

  return { isLoading, readyToClaim, claimMyPoints: claimMyPointsImpl } as const;
}

export default useClaimMyPointsFromReferrals;
