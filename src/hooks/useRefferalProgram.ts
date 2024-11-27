import { useEffect, useState } from "react";

import { getEtherContractWithSigner } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { IRentalityAdminGateway, IRentalityReferralProgramContract } from "@/model/blockchain/IRentalityContract";
import { AllRefferalInfoDTO, ReadyToClaim, ReadyToClaimRefferalHash, RefferalAccrualType, RefferalHashDTO, RefferalHistory, RefferalProgram, Tear } from "@/model/blockchain/schemas";

const useInviteLink = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [rentalityContract, setRentalityContract] = useState<IRentalityReferralProgramContract | null>(null);
  const [rentalityAdminContract, setRentalityAdminContract] = useState<IRentalityAdminGateway | null>(null);
  const [inviteHash, setHash] = useState("");
  const [points, setPoints] = useState(0);
  const ethereumInfo = useEthereum();


      
      const getPoints = async () => {
    if (!rentalityContract) {
      setIsLoading(true)
      console.error("get hash error: rentalityContract is null");
      return null;
    }
    if (!ethereumInfo) {
      setIsLoading(true)
      console.error("get hash error: ethereum info is null");
      return null;
    }
    try {
      let points = await rentalityContract.addressToPoints(ethereumInfo.walletAddress);
      setPoints(Number.parseInt(points.toString()));
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const getHash = async () => {
    if (!rentalityContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
      setHash(await rentalityContract.referralHash(ethereumInfo.walletAddress));
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  useEffect(() => {

    
    if (!ethereumInfo || !ethereumInfo.provider) {
      if (rentalityContract !== null) {
        console.debug(`Reset rentalityContract`);
        setRentalityContract(null);
        setIsLoading(true)
      }
      return;
    }
    const getRentalityContact = async () => {
    

      const rentality = (await getEtherContractWithSigner(
        "admin",
        ethereumInfo.signer
      )) as unknown as IRentalityAdminGateway;

      if (!rentality) {
        console.error("getRentalityContact error: rentalityContract is null");
        return;
      }
      setRentalityAdminContract(rentality);
      setIsLoading(false)
    };

    getRentalityContact();
  }, [ethereumInfo, ethereumInfo && ethereumInfo.signer]);


  useEffect(() => {

     
    if (!ethereumInfo || !ethereumInfo.provider) {
      if (rentalityContract !== null) {
        console.debug(`Reset rentalityContract`);
        setRentalityContract(null);
        setIsLoading(true)
      }
      return;
    }
    const getRentalityContact = async () => {
  
      const rentality = (await getEtherContractWithSigner(
        "refferalPogram",
        ethereumInfo.signer
      )) as unknown as IRentalityReferralProgramContract;


      if (!rentality) {
        console.error("getRentalityContact error: rentalityContract is null");
        return;
      }
      setRentalityContract(rentality);
      setIsLoading(false)
    };

    getRentalityContact();
    getHash();
    getPoints();
  }, [ethereumInfo, ethereumInfo && ethereumInfo.signer]);


  const claimPoints = async () => {
    if (!rentalityContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
    await rentalityContract.claimPoints(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };


  const getReadyToClaim = async (): Promise<ReadyToClaim | null> => {
    if (!rentalityContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
   return await rentalityContract.getReadyToClaim(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const getReadyToClaimFromRefferalHash = async (): Promise<RefferalHashDTO | null> => {
    if (!rentalityContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
   return await rentalityContract.getReadyToClaimFromRefferalHash(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const claimRefferalPoints = async () => {
    if (!rentalityContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
   await rentalityContract.claimRefferalPoints(ethereumInfo.walletAddress);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const getRefferalPointsInfo = async (): Promise<AllRefferalInfoDTO | null> => {
    if (!rentalityContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
  return await rentalityContract.getRefferalPointsInfo();
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };
  

  const getPointsHistory = async (): Promise<RefferalHistory[] | null> => {
    if (!rentalityContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
  return await rentalityContract.getPointsHistory();
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };


  const manageRefferalBonusAccrual = async (
    accrualType: RefferalAccrualType,
    program: RefferalProgram,
    points: number, 
    pointsWithReffHash: number
  )  => {
    if (!rentalityAdminContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
  return await rentalityAdminContract.manageRefferalBonusAccrual(accrualType, program, points, pointsWithReffHash);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };
  const calculateUniqUsers = (pointsInfo: ReadyToClaimRefferalHash[]) => {
   return new Set(pointsInfo.map(points => points.user)).size
} 


  const manageRefferalDiscount = async (
    program: RefferalProgram,
    tear: Tear,
    points: number, 
    pecrents: number
  )  => {
    if (!rentalityAdminContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
  return await rentalityAdminContract.manageRefferalDiscount( program, tear, points, pecrents);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };


  const manageTearInfo = async (
    tear: Tear,
    from: number, 
    to: number
  )  => {
    if (!rentalityAdminContract) {
      console.error("get hash error: rentalityContract is null");
      setIsLoading(true)
      return null;
    }
    if (!ethereumInfo) {
      console.error("get hash error: ethereum info is null");
      setIsLoading(true)
      return null;
    }
    try {
  return await rentalityAdminContract.manageTearInfo( tear, from, to);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };
  
  
  
  
  
  
  
  
  


  return [
    inviteHash,
    points,
    claimPoints,
    getReadyToClaim,
    getReadyToClaimFromRefferalHash,
    claimRefferalPoints,
    getRefferalPointsInfo,
    getPointsHistory,
    manageRefferalDiscount,
    manageTearInfo,
    calculateUniqUsers,
    isLoading
  ] as const;
};

export default useInviteLink;