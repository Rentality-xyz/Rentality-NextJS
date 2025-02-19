import { useEffect, useState } from "react";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";
import useReferralLinkLocalStorage from "@/features/referralProgram/hooks/useSaveReferralLinkToLocalStorage";
import { isEmpty } from "@/utils/string";
import { useQueryClient } from "@tanstack/react-query";
import { REFERRAL_LINKS_QUERY_KEY } from "@/features/referralProgram/hooks/useFetchReferralLinks";

export type ProfileSettings = {
  profilePhotoUrl: string;
  nickname: string;
  phoneNumber: string;
  isPhoneNumberVerified: boolean;
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
  isPhoneNumberVerified: false,
  tcSignature: "",
  fullname: "",
  documentType: "",
  drivingLicenseNumber: "",
  drivingLicenseExpire: undefined,
  issueCountry: "",
  email: "",
};

const useProfileSettings = () => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(emptyProfileSettings);
  const { getLocalReferralCode, resetReferralCode } = useReferralLinkLocalStorage();
  const queryClient = useQueryClient();

  const saveProfileSettings = async (newProfileSettings: ProfileSettings) => {
    if (!rentalityContracts) {
      console.error("saveProfileSettings error: rentalityContract is null");
      return false;
    }

    const localReferralHash = getLocalReferralCode();
    const referralHash =
      !isEmpty(localReferralHash) && localReferralHash.startsWith("0x") ? localReferralHash : ZERO_4_BYTES_HASH;

    console.log("referralHash", JSON.stringify(referralHash, null, 2));

    const result = await rentalityContracts.gatewayProxy.setKYCInfo(
      newProfileSettings.nickname,
      newProfileSettings.phoneNumber,
      newProfileSettings.profilePhotoUrl,
      newProfileSettings.email,
      newProfileSettings.tcSignature,
      referralHash
    );

    if (result.ok) {
      resetReferralCode();
    }
    queryClient.invalidateQueries({ queryKey: [REFERRAL_LINKS_QUERY_KEY] });
    return result.ok;
  };

  useEffect(() => {
    const getProfileSettings = async (rentalityContracts: IRentalityContracts | null) => {
      if (!rentalityContracts) {
        console.error("getTrip error: contract is null");
        return;
      }

      const result = await rentalityContracts.gatewayProxy.getMyFullKYCInfo();
      if (!result.ok) return;

      const myProfileSettings: ProfileSettings = {
        profilePhotoUrl: getIpfsURI(result.value.kyc.profilePhoto),
        nickname: result.value.kyc.name,
        phoneNumber: formatPhoneNumber(result.value.kyc.mobilePhoneNumber),
        isPhoneNumberVerified: result.value.isPhoneVerified,
        tcSignature: result.value.kyc.TCSignature,
        fullname: result.value.kyc.surname,
        documentType: "driving license",
        drivingLicenseNumber: result.value.kyc.licenseNumber,
        drivingLicenseExpire:
          result.value.kyc.expirationDate > 0
            ? getDateFromBlockchainTimeWithTZ(result.value.kyc.expirationDate, UTC_TIME_ZONE_ID)
            : undefined,
        issueCountry: result.value.additionalKYC.issueCountry,
        email: result.value.additionalKYC.email,
      };
      console.log("useProfileSettings.getProfileSettings() return data");
      return myProfileSettings;
    };

    if (!rentalityContracts) return;

    getProfileSettings(rentalityContracts)
      .then((data) => {
        setProfileSettings(data ?? emptyProfileSettings);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContracts]);

  return [isLoading, profileSettings, saveProfileSettings] as const;
};

export default useProfileSettings;
