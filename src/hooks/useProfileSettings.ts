import { useEffect, useState } from "react";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getBlockchainTimeFromDate, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import moment from "moment";
import { ContractFullKYCInfoDTO, ContractKYCInfo } from "@/model/blockchain/schemas";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { UTC_TIME_ZONE_ID } from "@/utils/date";

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
};

const useProfileSettings = () => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(emptyProfileSettings);

  const getProfileSettings = async (rentalityContract: IRentalityContract) => {
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
      };
      return myProfileSettings;
    } catch (e) {
      console.error("getProfileSettings error:" + e);
    }
  };

  const saveProfileSettings = async (newProfileSettings: ProfileSettings) => {
    if (!rentalityContract) {
      console.error("saveProfileSettings error: rentalityContract is null");
      return false;
    }

    try {
      const transaction = await rentalityContract.setKYCInfo(
        newProfileSettings.nickname,
        newProfileSettings.phoneNumber,
        newProfileSettings.profilePhotoUrl,
        newProfileSettings.tcSignature
      );

      await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveProfileSettings error:" + e);
      return false;
    }
  };

  useEffect(() => {
    if (!rentalityContract) return;

    getProfileSettings(rentalityContract)
      .then((data) => {
        setProfileSettings(data ?? emptyProfileSettings);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContract]);

  return [isLoading, profileSettings, saveProfileSettings] as const;
};

export default useProfileSettings;
