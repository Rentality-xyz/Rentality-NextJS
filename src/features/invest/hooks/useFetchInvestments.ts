import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { useQuery } from "@tanstack/react-query";
import { InvestmentInfoWithMetadata } from "@/features/invest/models/investmentInfo";
import { mapContractInvestmentDTOToInvestmentInfoWithMetadata } from "../models/mappers/contractInvestmentDTOtoInvestmentInfo";

export const INVESTMENTS_LIST_QUERY_KEY = "InvestmentsList";

type QueryData = InvestmentInfoWithMetadata[];

const useFetchInvestments = () => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [INVESTMENTS_LIST_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchInvestments(rentalityContracts, ethereumInfo),
  });

  const data = queryResult.data ?? [];
  return { ...queryResult, data: data };
};

async function fetchInvestments(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.investment.getAllInvestments();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return Promise.all(
    result.value.map(async (value) => {
      const metadata = parseMetaData(await getMetaDataFromIpfs(value.investment.car.tokenUri));
      return mapContractInvestmentDTOToInvestmentInfoWithMetadata(value, metadata, ethereumInfo.chainId);
    })
  );
}

export default useFetchInvestments;
