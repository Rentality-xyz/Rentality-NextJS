import { getFileURI } from "@/features/filestore";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useQuery } from "@tanstack/react-query";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { emptyUserProfile, UserProfile } from "../models";
import { ethers, verifyMessage } from "ethers";
import { DEFAULT_AGREEMENT_MESSAGE, UTC_TIME_ZONE_ID } from "@/utils/constants";
import { isEmpty } from "@/utils/string";
import { isContract, verifySignature } from "@/utils/verifyERC1271";

export const USER_PROFILE_QUERY_KEY = "UserProfile";
type QueryData = UserProfile;

function useFetchUserProfile() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [USER_PROFILE_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchUserProfile(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? emptyUserProfile;
  return { ...queryResult, data: data };
}

async function fetchUserProfile(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getMyFullKYCInfo();
  if (!result.ok) {
    throw result.error;
  }

  const signature = result.value.kyc.TCSignature;
  const isEmptySignature = isEmpty(signature) || signature === "0x";
  const isSignatureCorrect =
    !isEmptySignature && (await checkSignature(ethereumInfo.walletAddress, ethereumInfo.provider, signature));

  const userProfile: UserProfile = {
    profilePhotoUrl: getFileURI(result.value.kyc.profilePhoto),
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
    isEmailVerified: result.value.isEmailVerified,
    pushToken: result.value.pushToken,
  };
  return userProfile;
}

async function checkSignature(wallet: string, provider: ethers.Provider, signature: string) {
  const smartWallet = await isContract(wallet, provider);
  if (smartWallet) {
    return verifySignature(wallet, DEFAULT_AGREEMENT_MESSAGE, signature, provider);
  } else {
    return verifyMessage(DEFAULT_AGREEMENT_MESSAGE, signature) === wallet;
  }
}

export default useFetchUserProfile;
