import { useEffect, useState } from "react";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";
import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios";

const useHostPublicListings = (hostAddressOrName: string) => {
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hostPublicListings, setHostPublicListings] = useState<BaseCarInfo[]>([]);

  useEffect(() => {
    const fetchHostPublicListings = async () => {
      if (isEmpty(hostAddressOrName)) return;

      const chainId = ethereumInfo?.chainId;

      try {
        setIsLoading(true);

        var url = new URL(`/api/hostPublicListings`, window.location.origin);
        if (chainId) url.searchParams.append("chainId", chainId.toString());
        url.searchParams.append("host", hostAddressOrName);
        const apiResponse: AxiosResponse = await axios.get(url.toString());

        if (apiResponse.status !== 200) {
          console.error(`fetchHostPublicListings fetch error: + ${apiResponse.status}`);
          return;
        }
        if (!Array.isArray(apiResponse.data)) {
          console.error("fetchHostPublicListings fetch wrong response format:");
          return;
        }

        const hostPublicListingsData = apiResponse.data as BaseCarInfo[];
        setHostPublicListings(hostPublicListingsData);
      } catch (e) {
        console.error("fetchHostPublicListings error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostPublicListings();
  }, [ethereumInfo, hostAddressOrName]);

  return [isLoading, hostPublicListings] as const;
};

export default useHostPublicListings;
