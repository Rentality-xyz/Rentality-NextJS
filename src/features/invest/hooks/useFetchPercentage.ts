import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { useQuery } from "@tanstack/react-query";
import { IRentalityAdminGateway } from "@/features/blockchain/models/IRentalityAdminGateway";
import { getEtherContractWithSigner } from "@/abis";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { logger } from "@/utils/logger";
import { Err } from "@/model/utils/result";
import { getEthersContractProxy } from "@/features/blockchain/models/EthersContractProxy";

export const INVESTMENTS_LIST_QUERY_KEY = "PlatformFee";

type QueryData = number;

const useFetchPlatformPercentage = () => {
  const ethereumInfo = useEthereum();

  const queryResult = useQuery<QueryData>({
    queryKey: [INVESTMENTS_LIST_QUERY_KEY, ethereumInfo],
    queryFn: async () => fetchPlatformFee(ethereumInfo),
  });

  const data = queryResult.data ?? [];
  return { ...queryResult, data: data };
};

async function fetchPlatformFee(ethereumInfo: EthereumInfo | null | undefined) {
  if (!ethereumInfo) {
    logger.error("createInvestCar error: Missing required contracts or ethereum info");
    throw Err(new Error("Missing required ethereum info"));
  }
  const rentalityAdmin = (await getEtherContractWithSigner(
    "admin",
    ethereumInfo.signer
  )) as unknown as IRentalityAdminGateway;

  if (!rentalityAdmin) {
    logger.error("getRentalityContact error: rentalityAdmin is null");
    throw Err(new Error("Missing required contract"));
  }
  const admin = getEthersContractProxy(rentalityAdmin);

  const result = await admin.getPlatformFeeInPPM();
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return Number(result.value) / 10000;
}

export default useFetchPlatformPercentage;
