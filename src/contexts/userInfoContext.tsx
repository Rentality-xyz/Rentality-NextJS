import { createContext, useContext, useEffect, useState } from "react";
import { useRentality } from "./rentalityContext";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { useEthereum } from "./web3/ethereumContext";
import { ContractFullKYCInfoDTO, ContractKYCInfo } from "@/model/blockchain/schemas";
import { tryGetEnsName } from "@/utils/ether";

export type UserInfo = {
  address: string;
  ensName: string | null;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string;
  drivingLicense: string;
};

export type UserInfoUpdate = {
  updateUserInfo: (c: UserInfo) => void;
};

const UserInfoContext = createContext<UserInfo | undefined>(undefined);
const UserInfoUpdateContext = createContext((value: UserInfo) => {});

export function useUserInfo() {
  return useContext(UserInfoContext);
}

export function useUserInfoUpdate() {
  return useContext(UserInfoUpdateContext);
}

export const UserInfoProvider = ({ children }: { children?: React.ReactNode }) => {
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | undefined>(undefined);
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!rentalityContract) {
        return;
      }
      if (!ethereumInfo) {
        return;
      }
      try {
        const myKYCInfo: ContractFullKYCInfoDTO = await rentalityContract.getMyFullKYCInfo();

        if (myKYCInfo == null) return;

        setCurrentUserInfo({
          address: ethereumInfo.walletAddress,
          ensName: await tryGetEnsName(ethereumInfo.provider, ethereumInfo.walletAddress),
          firstName: myKYCInfo.kyc.name,
          lastName: myKYCInfo.kyc.name,
          profilePhotoUrl: getIpfsURI(myKYCInfo.kyc.profilePhoto),
          drivingLicense: myKYCInfo.kyc.licenseNumber,
        });
      } catch (e) {
        console.error("UserInfoProvider error:" + e);
      }
    };
    loadUserInfo();
  }, [rentalityContract, ethereumInfo]);

  return (
    <UserInfoContext.Provider value={currentUserInfo}>
      <UserInfoUpdateContext.Provider value={setCurrentUserInfo}>{children}</UserInfoUpdateContext.Provider>
    </UserInfoContext.Provider>
  );
};
