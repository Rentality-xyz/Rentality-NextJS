import { useCallback, useEffect, useState } from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";

const useUserBalance = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const [isLoading, setIsLoading] = useState(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [points, setPoints] = useState(0);

  const updateData = useCallback(() => {
    setUpdateRequired(true);
  }, []);

  useEffect(() => {
    const fetchTotalPoints = async () => {
      if (!rentalityContracts || !ethereumInfo) return;
      if (!updateRequired) return;

      setUpdateRequired(false);

      try {
        const result = await rentalityContracts.referralProgram.addressToPoints(ethereumInfo.walletAddress);
        if (result.ok) {
          setPoints(Number(result.value));
        }
      } catch (error) {
        console.error("fetchTotalPoints error: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalPoints();
  }, [rentalityContracts, ethereumInfo, updateRequired]);

  return {
    isLoading,
    points,
    updateData,
  } as const;
};

export default useUserBalance;
