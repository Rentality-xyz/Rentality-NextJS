import { create } from "zustand";

interface OwnReferralPointsSharedState {
  readyToClaim: number;
  setReadyToClaim: (value: number) => void;
  isClaiming: boolean;
  setIsClaiming: (value: boolean) => void;
}

const useOwnReferralPointsSharedStore = create<OwnReferralPointsSharedState>((set) => ({
  readyToClaim: 0,
  setReadyToClaim: (value) => set({ readyToClaim: value }),
  isClaiming: false,
  setIsClaiming: (value) => set({ isClaiming: value }),
}));

export default useOwnReferralPointsSharedStore;
