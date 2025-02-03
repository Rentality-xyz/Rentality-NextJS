import { useRentality } from "@/contexts/rentalityContext";
import { useState, useEffect } from "react";
import { InvestmentDTO, InvestmentWithMetadata } from "@/model/blockchain/schemas";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { mapInvestmentDTO, MappedInvestmentInfo } from "@/model/InvestmentInfo";
import { InvestmentInfo } from "@/model/Investment";
const useGetInvestments = () => {
  const {rentalityContracts} = useRentality();
  const ethereumInfo = useEthereum();
  const [investments, setInvestments] = useState<MappedInvestmentInfo[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [updateRequired, setUpdate] = useState<Boolean>(false);
  const updateData = () => {
    setUpdate(true);
  };

  const address = ethereumInfo?.walletAddress;

  const handleClaimIncome = async (investId: number) => {
    if (!ethereumInfo) return;
    if (!rentalityContracts) return;

    await rentalityContracts.investment.claimAllMy(investId);
  };

  const handleStartHosting = async (investId: number) => {
    if (!ethereumInfo) return;
    if (!rentalityContracts) return;
    await rentalityContracts.investment.claimAndCreatePool(investId);
  };
  const handleInvest = async (amount: number, investId: number) => {
    if (!ethereumInfo) return;
    if (!rentalityContracts) return;
   
   const valueInEth = await rentalityContracts.currencyConverter.getFromUsdLatest(ETH_DEFAULT_ADDRESS, BigInt(amount * 100));
   if(valueInEth.ok) {
   await rentalityContracts.investment.invest(investId, { value:valueInEth.value[0] });
   }
  };

  useEffect(() => {
    let initialize = async () => {
      if (!rentalityContracts) return;
      if (!ethereumInfo) return;
     
      let res = await rentalityContracts.investment.getAllInvestments()

      if(res.ok) {

     const investmentInfo: InvestmentDTO[] = res.value;
      const result = await Promise.all(
        investmentInfo.map(async (value) => {
          const metadata = parseMetaData(await getMetaDataFromIpfs(value.investment.car.tokenUri));
          return mapInvestmentDTO({
            investment: value,
            metadata: {...metadata, image: metadata.mainImage},
          }, ethereumInfo.chainId);
        })
      );
      setInvestments(result);
      setIsLoading(false);
      // setUpdate(false)
    };
  }
    initialize();
  }, [ethereumInfo, rentalityContracts]);
  return { isLoading, investments, updateData, handleInvest, address, handleStartHosting, handleClaimIncome } as const;
}
export default useGetInvestments;
