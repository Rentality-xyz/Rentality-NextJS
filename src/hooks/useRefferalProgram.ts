import { useEffect, useState } from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractAllRefferalInfoDTO,
  ContractReadyToClaimDTO,
  ContractRefferalHashDTO,
  ContractReadyToClaimFromHash,
  ContractProgramHistory,
} from "@/model/blockchain/schemas";
import { useRentality } from "@/contexts/rentalityContext";

const useRefferalProgram = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [inviteHash, setHash] = useState("");
  const [points, setPoints] = useState(0);
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

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
        setHash(await rentalityContracts.referralProgram.referralHash(ethereumInfo.walletAddress));
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
    }

    getHash();
    getPoints();
    setIsLoading(false);
  }, [rentalityContracts, ethereumInfo]);

  const claimPoints = async () => {
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
      await rentalityContracts.referralProgram.claimPoints(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const getReadyToClaim = async (): Promise<ContractReadyToClaimDTO | null> => {
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
  };

  const getReadyToClaimFromRefferalHash = async (): Promise<ContractRefferalHashDTO | null> => {
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

  const claimRefferalPoints = async () => {
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

  const getRefferalPointsInfo = async (): Promise<ContractAllRefferalInfoDTO | null> => {
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
  };

  const getPointsHistory = async (): Promise<ContractProgramHistory[] | null> => {
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
  };

  const calculateUniqUsers = (pointsInfo: ContractReadyToClaimFromHash[]) => {
    return new Set(pointsInfo.map((points) => points.user)).size;
  };

  return {
    inviteHash,
    points,
    claimPoints,
    getReadyToClaim,
    getReadyToClaimFromRefferalHash,
    claimRefferalPoints,
    getRefferalPointsInfo,
    getPointsHistory,
    calculateUniqUsers,
    isLoading,
  } as const;
};

export default useRefferalProgram;
