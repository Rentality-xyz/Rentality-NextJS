import { getIpfsURI } from "@/utils/ipfsUtils";
import { useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { useQuery } from "@tanstack/react-query";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { emptyUserProfile, UserProfile } from "../models";
import { ethers, verifyMessage } from "ethers";
import { DEFAULT_AGREEMENT_MESSAGE } from "@/utils/constants";
import { isEmpty } from "@/utils/string";
import { ContractFullKYCInfoDTO } from "@/model/blockchain/schemas";
import { Result } from "@/model/utils/result";
import { useWallets } from "@privy-io/react-auth";
import { isContract, verifySignature } from "@/utils/verifyERC1271";

export const USER_PROFILE_QUERY_KEY = "UserProfile";

type QueryData = UserProfile;

const checkSignature = async (wallet: string, provider: ethers.Provider, signature: string) => {
  const smartWallet = await isContract(wallet, provider);
  if (smartWallet) {
    return verifySignature(wallet, DEFAULT_AGREEMENT_MESSAGE, signature, provider);
  } else {
    return verifyMessage(DEFAULT_AGREEMENT_MESSAGE, signature) === wallet;
}
}
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
        !isEmptySignature && await checkSignature(ethereumInfo.walletAddress, ethereumInfo.provider, signature);

      const userProfile: UserProfile = {
        profilePhotoUrl: getIpfsURI(result.value.kyc.profilePhoto),
        nickname: result.value.kyc.name,
        phoneNumber: formatPhoneNumber(result.value.kyc.mobilePhoneNumber),
        isPhoneNumberVerified: result.value.isPhoneVerified,
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
