import { useCallback, useEffect, useState } from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractAllRefferalInfoDTO as ContractAllReferralInfoDTO,
  ContractReadyToClaimDTO,
  ContractRefferalHashDTO as ContractReferralHashDTO,
  ContractReadyToClaimFromHash,
  ContractProgramHistory,
} from "@/model/blockchain/schemas";
import { useRentality } from "@/contexts/rentalityContext";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";

const useReferralProgram = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [inviteHash, setHash] = useState("");
  const [usedInviteHash, setUsedInviteHash] = useState("");
  const [points, setPoints] = useState(0);
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const updateData = useCallback(() => {
    setUpdateRequired(true);
  }, []);

  useEffect(() => {
    const getHash = async () => {
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
      try {
        const response = await rentalityContracts.referralProgram.getMyRefferalInfo();
        setHash(response.myHash !== ZERO_4_BYTES_HASH ? response.myHash : "");
        setUsedInviteHash(response.savedHash !== ZERO_4_BYTES_HASH ? response.savedHash : "");
      } catch (e) {
        console.error("get hash error:" + e);
        return null;
      }
    };

    const getPoints = async () => {
      if (!rentalityContracts) {
        setIsLoading(true);
        console.error("get hash error: rentalityContract is null");
        return null;
      }
      if (!ethereumInfo) {
        setIsLoading(true);
        console.error("get hash error: ethereum info is null");
        return null;
      }
      try {
        let points = await rentalityContracts.referralProgram.addressToPoints(ethereumInfo.walletAddress);
        setPoints(Number.parseInt(points.toString()));
      } catch (e) {
        console.error("get hash error:" + e);
        return null;
      }
    };

    if (!rentalityContracts) {
      setIsLoading(true);
      return;
    }

    if (!updateRequired) return;

    setUpdateRequired(false);

    getHash();
    getPoints();
    setIsLoading(false);
  }, [rentalityContracts, ethereumInfo, updateRequired]);

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
    try {
      return await rentalityContracts.referralProgram.getReadyToClaim(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
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
    try {
      return await rentalityContracts.referralProgram.getReadyToClaimFromRefferalHash(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const claimReferralPoints = async () => {
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
    try {
      await rentalityContracts.referralProgram.claimRefferalPoints(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const getReferralPointsInfo = useCallback(async (): Promise<ContractAllReferralInfoDTO | null> => {
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
    try {
      return await rentalityContracts.referralProgram.getRefferalPointsInfo();
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  }, [ethereumInfo, rentalityContracts]);

  const getPointsHistory = useCallback(async (): Promise<ContractProgramHistory[] | null> => {
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
    try {
      return await rentalityContracts.referralProgram.getPointsHistory();
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  }, [ethereumInfo, rentalityContracts]);

  const calculateUniqUsers = (pointsInfo: ContractReadyToClaimFromHash[]) => {
    return new Set(pointsInfo.map((points) => points.user)).size;
  };

  return {
    inviteHash,
    usedInviteHash,
    points,
    updateData,
    getReadyToClaim,
    getReadyToClaimFromReferralHash,
    claimReferralPoints,
    getReferralPointsInfo,
    getPointsHistory,
    calculateUniqUsers,
    isLoading,
  } as const;
};

export default useReferralProgram;
