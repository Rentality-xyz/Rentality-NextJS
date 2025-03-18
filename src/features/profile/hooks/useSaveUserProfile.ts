import { useRentality } from "@/contexts/rentalityContext";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";
import useReferralLinkLocalStorage from "@/features/referralProgram/hooks/useSaveReferralLinkToLocalStorage";
import { isEmpty } from "@/utils/string";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REFERRAL_LINKS_QUERY_KEY } from "@/features/referralProgram/hooks/useFetchReferralLinks";
import { USER_PROFILE_QUERY_KEY } from "./useFetchUserProfile";
import { Err, Result } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { deleteFileByUrl, saveUserProfilePhoto } from "@/features/filestore/pinata/utils";
import { useEthereum } from "@/contexts/web3/ethereumContext";

export type SaveUserProfileRequest = {
  nickname: string;
  profilePhotoSrc: string;
  oldProfilePhotoUrl: string;
  phoneNumber: string;
  email: string;
  tcSignature: string;
};

function useSaveUserProfile() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { getLocalReferralCode, resetReferralCode } = useReferralLinkLocalStorage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SaveUserProfileRequest): Promise<Result<boolean, Error>> => {
      try {
        if (!rentalityContracts || !ethereumInfo) {
          logger.error("saveUserProfile error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        const isNewPhoto = request.profilePhotoSrc !== request.oldProfilePhotoUrl;
        let profilePhotoUrl = request.oldProfilePhotoUrl;

        if (isNewPhoto) {
          const blob = await (await fetch(request.profilePhotoSrc)).blob();
          const profileImageFile = new File([blob], "profileImage", { type: "image/png" });

          const saveImageResult = await saveUserProfilePhoto(profileImageFile, ethereumInfo.chainId, {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo.walletAddress,
          });

          if (!saveImageResult.ok) return saveImageResult;

          profilePhotoUrl = saveImageResult.value.url;
        }

        const localReferralHash = getLocalReferralCode();
        const referralHash =
          !isEmpty(localReferralHash) && localReferralHash.startsWith("0x") ? localReferralHash : ZERO_4_BYTES_HASH;

        const result = await rentalityContracts.gateway.setKYCInfo(
          request.nickname,
          request.phoneNumber,
          profilePhotoUrl,
          request.email,
          request.tcSignature,
          referralHash
        );

        if (isNewPhoto) {
          await deleteFileByUrl(result.ok ? request.oldProfilePhotoUrl : profilePhotoUrl);
        }

        return result;
      } catch (error) {
        logger.error("saveUserProfile error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        resetReferralCode();
        queryClient.invalidateQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [REFERRAL_LINKS_QUERY_KEY] });
      }
    },
  });
}

export default useSaveUserProfile;
