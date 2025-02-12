import { create } from "zustand";

interface OwnReferralPointsTransactionState {
  isClaiming: boolean;
  setIsClaiming: (value: boolean) => void;
}

const useOwnReferralPointsTransactionStore = create<OwnReferralPointsTransactionState>((set) => ({
  isClaiming: false,
  setIsClaiming: (value) => set({ isClaiming: value }),
}));

export default useOwnReferralPointsTransactionStore;
