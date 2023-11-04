import { useEffect, useState } from "react";
import { IRentalityContract, KYCInfo } from "@/model/blockchain/IRentalityContract";
import { getIpfsURIfromPinata } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";

export type ProfileSettings = {
  profilePhotoUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  drivingLicenseNumber: string;
  drivingLicenseExpire: Date | undefined;
};

const emptyProfileSettings: ProfileSettings = {
  profilePhotoUrl: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  drivingLicenseNumber: "",
  drivingLicenseExpire: undefined,
};

const useProfileSettings = () => {
  const rentalityInfo = useRentality();
  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(emptyProfileSettings);

  const getProfileSettings = async (rentalityContract: IRentalityContract) => {
    try {
      if (rentalityContract == null) {
        console.error("getTrip error: contract is null");
        return;
      }
      const myKYCInfo: KYCInfo = await rentalityContract.getMyKYCInfo();

      if (myKYCInfo == null) return;

      let myProfileSettings: ProfileSettings = {
        profilePhotoUrl: getIpfsURIfromPinata(myKYCInfo.profilePhoto),
        firstName: myKYCInfo.name,
        lastName: myKYCInfo.surname,
        phoneNumber: myKYCInfo.mobilePhoneNumber,
        drivingLicenseNumber: myKYCInfo.licenseNumber,
        drivingLicenseExpire:
          myKYCInfo.expirationDate > 0 ? new Date(Number(myKYCInfo.expirationDate) * 1000) : undefined,
      };
      return myProfileSettings;
    } catch (e) {
      console.error("getProfileSettings error:" + e);
    }
  };

  const saveProfileSettings = async (newProfileSettings: ProfileSettings) => {
    if (!rentalityInfo) {
      console.error("saveProfileSettings error: rentalityInfo is null");
      return false;
    }

    try {
      const expirationDate =
        newProfileSettings.drivingLicenseExpire !== undefined
          ? BigInt(Math.floor(newProfileSettings.drivingLicenseExpire.getTime() / 1000))
          : BigInt(0);

      let transaction = await rentalityInfo.rentalityContract.setKYCInfo(
        newProfileSettings.firstName,
        newProfileSettings.lastName,
        newProfileSettings.phoneNumber,
        newProfileSettings.profilePhotoUrl,
        newProfileSettings.drivingLicenseNumber,
        expirationDate
      );

      const result = await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveProfileSettings error:" + e);
      return false;
    }
  };

  useEffect(() => {
    if (!rentalityInfo) return;

    getProfileSettings(rentalityInfo.rentalityContract)
      .then((data) => {
        setProfileSettings(data ?? emptyProfileSettings);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, [rentalityInfo, emptyProfileSettings]);

  return [dataFetched, profileSettings, saveProfileSettings] as const;
};

export default useProfileSettings;
