import { getIpfsURI } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { useQuery } from "@tanstack/react-query";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { emptyUserProfile, UserProfile } from "../models";
import { verifyMessage } from "ethers";
import { DEFAULT_AGREEMENT_MESSAGE } from "@/utils/constants";
import { isEmpty } from "@/utils/string";

export const USER_PROFILE_QUERY_KEY = "UserProfile";

type QueryData = UserProfile;

const useFetchUserProfile = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  return useQuery<QueryData>({
    queryKey: [USER_PROFILE_QUERY_KEY, ethereumInfo?.walletAddress],
    initialData: emptyUserProfile,
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }

      const result = await rentalityContracts.gatewayProxy.getMyFullKYCInfo();
      if (!result.ok) {
        throw result.error;
      }

      const signature = result.value.kyc.TCSignature;
      const isEmptySignature = isEmpty(signature) || signature === "0x";
      const isSignatureCorrect =
        !isEmptySignature && verifyMessage(DEFAULT_AGREEMENT_MESSAGE, signature) === ethereumInfo.walletAddress;

      const userProfile: UserProfile = {
        profilePhotoUrl: getIpfsURI(result.value.kyc.profilePhoto),
        nickname: result.value.kyc.name,
        phoneNumber: formatPhoneNumber(result.value.kyc.mobilePhoneNumber),
        tcSignature: signature,
        isSignatureCorrect: isSignatureCorrect,
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
      return userProfile;
    },
    enabled: !!rentalityContracts,
  });
};

export default useFetchUserProfile;
