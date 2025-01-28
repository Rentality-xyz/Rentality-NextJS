import { useCallback } from "react";

const REFERRAL_CODE_STORAGE_KEY = "REFERRAL_CODE_STORAGE_KEY";

function useReferralLinkLocalStorage() {
  const getLocalReferralCode = useCallback(() => {
    try {
      if (typeof window === "undefined") return "";
      return localStorage.getItem(REFERRAL_CODE_STORAGE_KEY) ?? "";
    } catch (error) {
      console.error("getLocalReferralCode error: ", error);
      return "";
    }
  }, []);

  const saveReferralCode = useCallback((referralLink: string) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, referralLink.trim());
      }
    } catch (error) {
      console.error("saveReferralCode error: ", error);
    }
  }, []);

  const resetReferralCode = useCallback(() => {
    saveReferralCode("");
  }, [saveReferralCode]);

  return { getLocalReferralCode, saveReferralCode, resetReferralCode } as const;
}

export default useReferralLinkLocalStorage;
