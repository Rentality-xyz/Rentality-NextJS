import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { mapContractInvestmentDTOToInvestmentInfoWithMetadata } from "@/model/mappers/contractInvestmentDTOtoInvestmentInfo";
import { ContractInvestmentDTO } from "@/model/blockchain/schemas";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useGetInvestments = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();
  const address = ethereumInfo?.walletAddress;

  // Получение инвестиций
  const { data: investments = [], isLoading } = useQuery({
    queryKey: ["investments", address],
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) return [];

      const res = await rentalityContracts.investment.getAllInvestments();
      if (!res.ok) throw new Error("Failed to fetch investments");

      const investmentInfo: ContractInvestmentDTO[] = res.value;
      return Promise.all(
        investmentInfo.map(async (value) => {
          const metadata = parseMetaData(await getMetaDataFromIpfs(value.investment.car.tokenUri));
          return mapContractInvestmentDTOToInvestmentInfoWithMetadata(
            value,
            { ...metadata, image: metadata.mainImage },
            ethereumInfo.chainId
          );
        })
      );
    },
    enabled: !!rentalityContracts && !!ethereumInfo,
  });

  // Функция обновления данных
  const updateData = () => queryClient.invalidateQueries({ queryKey: ["investments", address] });

  // Мутация для клейма дохода
  const { mutateAsync: handleClaimIncome, isPending: isPendingClaimingIncome } = useMutation({
    mutationFn: async (investId: number) => {
      if (!rentalityContracts || !ethereumInfo) throw new Error("Contracts not initialized");
      await rentalityContracts.investment.claimAllMy(investId);
    },
    onSuccess: updateData,
  });

  // Мутация для начала хостинга
  const { mutateAsync: handleStartHosting, isPending: isPendingStartingHosting } = useMutation({
    mutationFn: async (investId: number) => {
      if (!rentalityContracts || !ethereumInfo) throw new Error("Contracts not initialized");
      await rentalityContracts.investment.claimAndCreatePool(investId);
    },
    onSuccess: updateData,
  });

  // Мутация для инвестирования
  const {
    mutateAsync: handleInvest,
    isPending,
    variables,
  } = useMutation({
    mutationFn: async ({ amount, investId }: { amount: number; investId: number }) => {
      if (!rentalityContracts || !ethereumInfo) throw new Error("Contracts not initialized");

      const valueInEth = await rentalityContracts.currencyConverter.getFromUsdLatest(
        ETH_DEFAULT_ADDRESS,
        BigInt(amount * 100)
      );
      if (!valueInEth.ok) throw new Error("Failed to convert currency");

      await rentalityContracts.investment.invest(investId, valueInEth.value[0], { value: valueInEth.value[0] });
    },
    onSuccess: updateData,
  });

  // Функция для проверки, идет ли запрос для конкретного `investmentId`
  const isPendingInvesting = (investmentId: number) => isPending && variables?.investId === investmentId;

  return {
    isLoading,
    investments,
    updateData,
    handleInvest,
    isPendingInvesting,
    address,
    handleStartHosting,
    isPendingStartingHosting,
    handleClaimIncome,
    isPendingClaimingIncome,
  } as const;
};

export default useGetInvestments;
