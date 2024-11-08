import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractFilterInfoDTO } from "@/model/blockchain/schemas";
import { validateContractFilterInfoDTO } from "@/model/blockchain/schemas_utils";

const useSearchFilterLimits = () => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [minCarYear, setMinCarYear] = useState<number>();
  const [maxCarPrice, setMaxCarPrice] = useState<number>();

  useEffect(() => {
    const getData = async () => {
      if (!rentalityContract) {
        console.error("useSearchFilterLimits getData error: contract is null");
        return;
      }

      setIsLoading(true);
      try {
        const getFilterInfoDto: ContractFilterInfoDTO = await rentalityContract.getFilterInfo(BigInt(1));

        validateContractFilterInfoDTO(getFilterInfoDto);

        setMinCarYear(Number(getFilterInfoDto.minCarYearOfProduction));
        setMaxCarPrice(Number(getFilterInfoDto.maxCarPrice));
      } catch (e) {
        console.error("getData error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!rentalityContract) return;

    getData();
  }, [rentalityContract]);

  return { isLoading, minCarYear, maxCarPrice } as const;
};

export default useSearchFilterLimits;
