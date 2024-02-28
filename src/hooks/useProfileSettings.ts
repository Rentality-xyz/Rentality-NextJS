import { useEffect, useState } from "react";
import { IRentalityContract, ContractKYCInfo } from "@/model/blockchain/IRentalityContract";
import { getIpfsURIfromPinata } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getBlockchainTimeFromDate, getDateFromBlockchainTime } from "@/utils/formInput";
import moment from "moment";

export type ProfileSettings = {
  profilePhotoUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  drivingLicenseNumber: string;
  drivingLicenseExpire: Date | undefined;
  isConfirmedTerms: boolean;
};

const emptyProfileSettings: ProfileSettings = {
  profilePhotoUrl: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  drivingLicenseNumber: "",
  drivingLicenseExpire: undefined,
  isConfirmedTerms: false,
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
      const myKYCInfo: ContractKYCInfo = await rentalityContract.getMyKYCInfo();

      if (myKYCInfo == null) return;

      let myProfileSettings: ProfileSettings = {
        profilePhotoUrl: getIpfsURIfromPinata(myKYCInfo.profilePhoto),
        firstName: myKYCInfo.name,
        lastName: myKYCInfo.surname,
        phoneNumber: formatPhoneNumber(myKYCInfo.mobilePhoneNumber),
        drivingLicenseNumber: myKYCInfo.licenseNumber,
        drivingLicenseExpire:
          myKYCInfo.expirationDate > 0 ? getDateFromBlockchainTime(myKYCInfo.expirationDate) : undefined,
        isConfirmedTerms: myKYCInfo.isTCPassed,
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
          ? getBlockchainTimeFromDate(moment.utc(newProfileSettings.drivingLicenseExpire).toDate())
          : BigInt(0);

      let transaction = await rentalityContract.setKYCInfo(
        newProfileSettings.firstName,
        newProfileSettings.lastName,
        newProfileSettings.phoneNumber,
        newProfileSettings.profilePhotoUrl,
        newProfileSettings.drivingLicenseNumber,
        expirationDate,
        true,
        newProfileSettings.isConfirmedTerms
      );

      const result = await transaction.wait();
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
