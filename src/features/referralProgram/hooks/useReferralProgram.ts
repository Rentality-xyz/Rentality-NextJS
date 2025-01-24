import { useCallback, useState } from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractAllRefferalInfoDTO as ContractAllReferralInfoDTO,
  ContractReadyToClaimDTO,
  ContractRefferalHashDTO as ContractReferralHashDTO,
  ContractReadyToClaimFromHash,
  ContractProgramHistory,
} from "@/model/blockchain/schemas";
import { useRentality } from "@/contexts/rentalityContext";

const useReferralProgram = () => {
  const [isLoading, setIsLoading] = useState(true);
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const getReadyToClaim = useCallback(async (): Promise<ContractReadyToClaimDTO | null> => {
    if (!rentalityContracts) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true);
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true);
      return null;
    }
    const result = await rentalityContracts.referralProgram.getReadyToClaim(ethereumInfo.walletAddress);
    return result.ok ? result.value : null;
  }, [ethereumInfo, rentalityContracts]);

  const getReadyToClaimFromReferralHash = async (): Promise<ContractReferralHashDTO | null> => {
    if (!rentalityContracts) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true);
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true);
      return null;
    }

    const result = await rentalityContracts.referralProgram.getReadyToClaimFromRefferalHash(ethereumInfo.walletAddress);
    return result.ok ? result.value : null;
  };

  const getReferralPointsInfo = useCallback(async (): Promise<ContractAllReferralInfoDTO | null> => {
    if (!rentalityContracts) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true);
      return null;
    }
    const result = await rentalityContracts.referralProgram.getRefferalPointsInfo();
    return result.ok ? result.value : null;
  }, [rentalityContracts]);

  const getPointsHistory = useCallback(async (): Promise<ContractProgramHistory[] | null> => {
    if (!rentalityContracts) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true);
      return null;
    }
    const result = await rentalityContracts.referralProgram.getPointsHistory();
    return result.ok ? result.value : null;
  }, [rentalityContracts]);

  const calculateUniqUsers = (pointsInfo: ContractReadyToClaimFromHash[]) => {
    return new Set(pointsInfo.map((points) => points.user)).size;
  };

  return {
    isLoading,
    getReadyToClaim,
    getReadyToClaimFromReferralHash,
    getReferralPointsInfo,
    getPointsHistory,
  } as const;
};

export default useReferralProgram;
