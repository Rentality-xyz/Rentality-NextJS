import { getIpfsURI } from "@/utils/ipfsUtils";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { formatPhoneNumber, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useQuery } from "@tanstack/react-query";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { emptyUserProfile, UserProfile } from "../models";
import { ethers, verifyMessage } from "ethers";
import { DEFAULT_AGREEMENT_MESSAGE, UTC_TIME_ZONE_ID } from "@/utils/constants";
import { isEmpty } from "@/utils/string";
import { isContract, verifySignature } from "@/utils/verifyERC1271";

export const COINBASE_VERIFICATION_QUERY_KEY = "CoinbaseVerification";

function useCoinbaseVerification() {
  const ethereumInfo = useEthereum();

  const queryResult = useQuery<Boolean>({
    queryKey: [COINBASE_VERIFICATION_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => checkCoinbaseVerification(ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? false;
  return { ...queryResult, data: data };
}

async function checkCoinbaseVerification(
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const response = await fetch("/api/profile/checkCoinbaseVerification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletAddress: ethereumInfo?.walletAddress,
      chainId: ethereumInfo?.chainId,
    }),
  });

  const result = await response.json();


  if (!result.ok) {
    throw result.error;
  }

  return result.isVerified;
}

export default useCoinbaseVerification;
