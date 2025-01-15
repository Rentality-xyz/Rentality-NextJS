import { useCallback } from "react";

const REFERRAL_CODE_STORAGE_KEY = "REFERRAL_CODE_STORAGE_KEY";

function useReferralLinkLocalStorage() {
  const getLocalReferralCode = useCallback(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(REFERRAL_CODE_STORAGE_KEY) ?? "";
  }, []);

  const saveReferralCode = useCallback((referralLink: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, referralLink);
    }
  }, []);

  const resetReferralCode = useCallback(() => {
    saveReferralCode("");
  }, [saveReferralCode]);

  return { getLocalReferralCode, saveReferralCode, resetReferralCode } as const;
}

export default useReferralLinkLocalStorage;
