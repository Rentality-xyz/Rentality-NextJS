import { useRentality } from "@/contexts/rentalityContext";
import { ZERO_4_BYTES_HASH } from "@/utils/wallet";
import useReferralLinkLocalStorage from "@/features/referralProgram/hooks/useSaveReferralLinkToLocalStorage";
import { isEmpty } from "@/utils/string";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { REFERRAL_LINKS_QUERY_KEY } from "@/features/referralProgram/hooks/useFetchReferralLinks";
import { USER_PROFILE_QUERY_KEY } from "./useFetchUserProfile";
import { Err, Result } from "@/model/utils/result";

export type SaveUserProfileRequest = {
  nickname: string;
  profilePhotoUrl: string;
  phoneNumber: string;
  email: string;
  tcSignature: string;
};

const useSaveUserProfile = () => {
  const { rentalityContracts } = useRentality();
  const { getLocalReferralCode, resetReferralCode } = useReferralLinkLocalStorage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SaveUserProfileRequest): Promise<Result<boolean, Error>> => {
      try {
        if (!rentalityContracts) {
          console.error("saveUserProfile error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        const localReferralHash = getLocalReferralCode();
        const referralHash =
          !isEmpty(localReferralHash) && localReferralHash.startsWith("0x") ? localReferralHash : ZERO_4_BYTES_HASH;

        const result = await rentalityContracts.gatewayProxy.setKYCInfo(
          request.nickname,
          request.phoneNumber,
          request.profilePhotoUrl,
          request.email,
          request.tcSignature,
          referralHash
        );

        return result;
      } catch (error) {
        console.error("saveUserProfile error: ", error);
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
};

export default useSaveUserProfile;
