import { useEffect } from "react";
import { logger } from "@/utils/logger";
import { isEmpty } from "@/utils/string";
import useFetchUserProfile from "@/features/profile/hooks/useFetchUserProfile";
import { useEthereum } from "@/contexts/web3/ethereumContext";

export function useNativePushToken() {
  const ethereumInfo = useEthereum();
  const { isLoading, data: userProfile } = useFetchUserProfile();

  useEffect(() => {
    // @ts-ignore
    const token = window.nativeBridge?.getPushToken?.();
    if (token &&
      ethereumInfo?.walletAddress &&
      ethereumInfo?.chainId &&
      !isLoading &&
      userProfile.pushToken != token &&
      !isEmpty(token)
    ) {
      setPushToken(token, ethereumInfo.walletAddress, ethereumInfo.chainId).then((r) => {});
    }
  }, [ethereumInfo, userProfile, isLoading]);
}

async function setPushToken(pushToken: string, userAddress: string, chainId: number) {
  try {
    const response = await fetch("/api/pushNotifications/setPushToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAddress: userAddress,
        chainId: chainId,
        pushToken: pushToken,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      logger.error("setPushToken error:" + result.error);
    } else {
      logger.info(`Push token updated for ${userAddress}`)
    }
  } catch (error) {
    logger.error("setPushToken error:" + error);
  }
}
