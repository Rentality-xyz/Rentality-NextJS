import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../abis";
import { IRentalityContract, KYCInfo } from "@/model/blockchain/IRentalityContract";
import { getIpfsURIfromPinata } from "@/utils/ipfsUtils";

export type ProfileSettings = {
  profilePhotoUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  drivingLicenseNumber: string;
  drivingLicenseExpire: Date | undefined;
};

const useProfileSettings = () => {
  const emptyProfileSettings: ProfileSettings = {
    profilePhotoUrl: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    drivingLicenseNumber: "",
    drivingLicenseExpire: undefined,
  };

  const [dataFetched, setDataFetched] = useState<Boolean>(false);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(emptyProfileSettings);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(rentalityJSON.address, rentalityJSON.abi, signer) as unknown as IRentalityContract;
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

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
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("saveProfileSettings error: contract is null");
        return false;
      }

      const expirationDate =
        newProfileSettings.drivingLicenseExpire !== undefined
          ? BigInt(Math.floor(newProfileSettings.drivingLicenseExpire.getTime() / 1000))
          : BigInt(0);

      let transaction = await rentalityContract.setKYCInfo(
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
    getRentalityContract()
      .then((contract) => {
        if (contract !== undefined) {
          return getProfileSettings(contract);
        }
      })
      .then((data) => {
        setProfileSettings(data ?? emptyProfileSettings);
        setDataFetched(true);
      })
      .catch(() => setDataFetched(true));
  }, []);

  return [dataFetched, profileSettings, saveProfileSettings] as const;
};

export default useProfileSettings;
