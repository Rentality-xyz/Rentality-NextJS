import { useEffect, useState } from "react";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { useEthereum } from "@/contexts/web3/ethereumContext";

const useHostPublicListings = (hostAddress: string) => {
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [hostPublicListings, setHostPublicListings] = useState<BaseCarInfo[]>([]);

  useEffect(() => {
    const fetchHostPublicListings = async () => {
      const chainId = ethereumInfo?.chainId ?? "default";

      try {
        setIsLoading(true);
        const apiResponse = await fetch(`/api/hostPublicListings?chainId=${chainId}&hostAddress=${hostAddress}`);
        if (!apiResponse.ok) {
          console.error(`fetchHostPublicListings fetch error: + ${apiResponse.statusText}`);
          return;
        }

        const apiJson = await apiResponse.json();
        if (!Array.isArray(apiJson)) {
          console.error("fetchHostPublicListings fetch wrong response format:");
          return;
        }

        const hostPublicListingsData = apiJson as BaseCarInfo[];
        setHostPublicListings(hostPublicListingsData);
      } catch (e) {
        console.error("fetchHostPublicListings error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostPublicListings();
  }, [ethereumInfo, hostAddress]);

  return [isLoading, hostPublicListings] as const;
};

export default useHostPublicListings;
