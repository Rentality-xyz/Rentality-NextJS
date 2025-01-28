import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";

const useReferralLinks = () => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState(true);
  const [inviteHash, setHash] = useState("");
  const [usedInviteHash, setUsedInviteHash] = useState("");

  useEffect(() => {
    const fetchLinks = async () => {
      if (!rentalityContracts) return;

      try {
        const result = await rentalityContracts.referralProgram.getMyRefferalInfo();

        if (result.ok) {
          setHash(result.value.myHash !== ZERO_4_BYTES_HASH ? result.value.myHash : "");
          setUsedInviteHash(result.value.savedHash !== ZERO_4_BYTES_HASH ? result.value.savedHash : "");
        }
      } catch (error) {
        console.error("fetchLinks error: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [rentalityContracts]);

  return {
    inviteHash,
    usedInviteHash,
    isLoading,
  } as const;
};

export default useReferralLinks;
