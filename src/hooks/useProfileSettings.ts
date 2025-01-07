import { useEffect, useState } from "react";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { ContractFullKYCInfoDTO } from "@/model/blockchain/schemas";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { usePrivy } from "@privy-io/react-auth";
import { ZERO_HASH } from "@/utils/wallet";
import { isEmpty } from "@/utils/string";
import { ethers } from "ethers";

export type ProfileSettings = {
  profilePhotoUrl: string;
  nickname: string;
  phoneNumber: string;
  tcSignature: string;
  fullname: string;
  documentType: string;
  drivingLicenseNumber: string;
  drivingLicenseExpire: Date | undefined;
  issueCountry: string;
  email: string;
  reflink: string;
};

const emptyProfileSettings: ProfileSettings = {
  profilePhotoUrl: "",
  nickname: "",
  phoneNumber: "",
  tcSignature: "",
  fullname: "",
  documentType: "",
  drivingLicenseNumber: "",
  drivingLicenseExpire: undefined,
  issueCountry: "",
  email: "",
  reflink: "",
};

const useProfileSettings = () => {
  const { ready, authenticated } = usePrivy();
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(emptyProfileSettings);

  const getProfileSettings = async (rentalityContract: IRentalityContract | null) => {
    try {
      if (rentalityContract == null) {
        console.error("getTrip error: contract is null");
        return;
      }
      const myKYCInfo: ContractFullKYCInfoDTO = await rentalityContract.getMyFullKYCInfo();

      if (myKYCInfo == null) return;

      let myProfileSettings: ProfileSettings = {
        profilePhotoUrl: getIpfsURI(myKYCInfo.kyc.profilePhoto),
        nickname: myKYCInfo.kyc.name,
        phoneNumber: formatPhoneNumber(myKYCInfo.kyc.mobilePhoneNumber),
        tcSignature: myKYCInfo.kyc.TCSignature,
        fullname: myKYCInfo.kyc.surname,
        documentType: "driving license",
        drivingLicenseNumber: myKYCInfo.kyc.licenseNumber,
        drivingLicenseExpire:
          myKYCInfo.kyc.expirationDate > 0
            ? getDateFromBlockchainTimeWithTZ(myKYCInfo.kyc.expirationDate, UTC_TIME_ZONE_ID)
            : undefined,
        issueCountry: myKYCInfo.additionalKYC.issueCountry,
        email: myKYCInfo.additionalKYC.email,
        reflink: "", //TODO was not found  myKYCInfo.additionalKYC.reflink,
      };
      console.log("useProfileSettings.getProfileSettings() return data");
      return myProfileSettings;
    } catch (e) {
      console.error(
        `useProfileSettings.getProfileSettings() error | privy ready: ${ready} | Privy authenticated: ${authenticated} | error:`,
        e
      );
    }
  };

  const saveProfileSettings = async (newProfileSettings: ProfileSettings) => {
    if (!rentalityContracts) {
      console.error("saveProfileSettings error: rentalityContract is null");
      return false;
    }

    try {
      const refHash = !isEmpty(newProfileSettings.reflink)
        ? newProfileSettings.reflink.length >= 66
          ? newProfileSettings.reflink
          : ethers.encodeBytes32String(newProfileSettings.reflink)
        : ZERO_HASH;

      const transaction = await rentalityContracts.gateway.setKYCInfo(
        newProfileSettings.nickname,
        newProfileSettings.phoneNumber,
        newProfileSettings.profilePhotoUrl,
        newProfileSettings.tcSignature,
        refHash
      );

      await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveProfileSettings error:" + e);
      return false;
    }
  };

  useEffect(() => {
    if (!rentalityContracts) return;

    getProfileSettings(rentalityContracts.gateway)
      .then((data) => {
        setProfileSettings(data ?? emptyProfileSettings);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContracts]);

  return [isLoading, profileSettings, saveProfileSettings] as const;
};

export default useProfileSettings;
