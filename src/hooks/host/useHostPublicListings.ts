import { useEffect, useState } from "react";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";

const useHostPublicListings = (hostAddress: string) => {
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [hostPublicListings, setHostPublicListings] = useState<BaseCarInfo[]>([]);

  useEffect(() => {
    const fetchHostPublicListings = async () => {
      if (isEmpty(hostAddress)) return;

      const chainId = ethereumInfo?.chainId;

      try {
        setIsLoading(true);

        var url = new URL(`/api/hostPublicListings`, window.location.origin);
        if (chainId) url.searchParams.append("chainId", chainId.toString());
        url.searchParams.append("hostAddress", hostAddress);
        const apiResponse = await fetch(url);

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
