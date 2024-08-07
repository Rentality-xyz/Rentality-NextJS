import { useRentality } from "@/contexts/rentalityContext";
import { useState, useEffect } from "react";
import { InvestmentWithMetadata } from "@/model/blockchain/schemas";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { getEtherContractWithSigner } from "@/abis";
import { IRentalityCurrencyConverterContract, IRentalityInvestment } from "@/model/blockchain/IRentalityContract";
import { getMetaDataFromIpfs, parseMetaData } from "@/utils/ipfsUtils";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
const useGetInvestments = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [investments, setInvestments] = useState<InvestmentWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [updateRequired, setUpdate] = useState<Boolean>(false);
  const updateData = () => {
    setUpdate(true);
  };

  const address = ethereumInfo?.walletAddress;

  const handleClaimIncome = async (investId: number) => {
    if (!ethereumInfo) return;
    if (!rentalityContract) return;

    await rentalityContract.claimAllMy(investId);
  };

  const handleStartHosting = async (investId: number) => {
    if (!ethereumInfo) return;
    let contract = (await getEtherContractWithSigner(
      "investService",
      ethereumInfo.signer
    )) as unknown as IRentalityInvestment;
    await contract.claimAndCreatePool(investId);
  };
  const handleInvest = async (amount: number, investId: number) => {
    if (!ethereumInfo) return;
    if (!rentalityContract) return;
    let contract = (await getEtherContractWithSigner(
      "currencyConverter",
      ethereumInfo.signer
    )) as unknown as IRentalityCurrencyConverterContract;
    const inEth = await contract.getFromUsdLatest(ETH_DEFAULT_ADDRESS, BigInt(amount * 100));
    await rentalityContract.invest(investId, { value: inEth[0] });
  };

  useEffect(() => {
    let initialize = async () => {
      if (!ethereumInfo) return;
      let contract = (await getEtherContractWithSigner(
        "investService",
        ethereumInfo.signer
      )) as unknown as IRentalityInvestment;
      let investmentInfo = await contract.getAllInvestments();

      const result = await Promise.all(
        investmentInfo.map(async (value) => {
          const metadata = parseMetaData(await getMetaDataFromIpfs(value.investment.car.tokenUri));
          return {
            investment: value,
            metadata,
          };
        })
      );
      setInvestments(result);
      setIsLoading(false);
      // setUpdate(false)
    };
    initialize();
  }, [ethereumInfo, rentalityContract]);

  return { isLoading, investments, updateData, handleInvest, address, handleStartHosting, handleClaimIncome } as const;
};
export default useGetInvestments;
