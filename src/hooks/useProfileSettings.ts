import { useEffect, useState } from "react";
import { getIpfsURIfromPinata } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getBlockchainTimeFromDate, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import moment from "moment";
import { ContractFullKYCInfoDTO, ContractKYCInfo } from "@/model/blockchain/schemas";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { UTC_TIME_ZONE_ID } from "@/utils/date";

export type ProfileSettings = {
  profilePhotoUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  drivingLicenseNumber: string;
  drivingLicenseExpire: Date | undefined;
  tcSignature: string;
};

const emptyProfileSettings: ProfileSettings = {
  profilePhotoUrl: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  drivingLicenseNumber: "",
  drivingLicenseExpire: undefined,
  tcSignature: "",
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
        profilePhotoUrl: getIpfsURIfromPinata(myKYCInfo.kyc.profilePhoto),
        firstName: myKYCInfo.kyc.name,
        lastName: myKYCInfo.kyc.surname,
        phoneNumber: formatPhoneNumber(myKYCInfo.kyc.mobilePhoneNumber),
        drivingLicenseNumber: myKYCInfo.kyc.licenseNumber,
        drivingLicenseExpire:
          myKYCInfo.kyc.expirationDate > 0
            ? getDateFromBlockchainTimeWithTZ(myKYCInfo.kyc.expirationDate, UTC_TIME_ZONE_ID)
            : undefined,
        tcSignature: myKYCInfo.kyc.TCSignature,
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
      const expirationDate =
        newProfileSettings.drivingLicenseExpire !== undefined
          ? getBlockchainTimeFromDate(moment.utc(newProfileSettings.drivingLicenseExpire.toDateString()).toDate())
          : BigInt(0);

      const transaction = await rentalityContract.setKYCInfo(
        newProfileSettings.firstName,
        // newProfileSettings.lastName,
        newProfileSettings.phoneNumber,
        newProfileSettings.profilePhotoUrl,
        {
          fullName: `${newProfileSettings.firstName} ${newProfileSettings.lastName}`,
          licenseNumber: newProfileSettings.drivingLicenseNumber,
          expirationDate: expirationDate,
          issueCountry: "",
          email: "",
        },
        // newProfileSettings.drivingLicenseNumber,
        // expirationDate,
        newProfileSettings.tcSignature,
        "0x"
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
