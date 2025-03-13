import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isEmpty } from "@/utils/string";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const EXIST_CAR_MAKES_QUERY_KEY = "ExistCarMakes";
export const EXIST_CAR_MODELS_QUERY_KEY = "ExistCarModels";

function useFetchExistPlatformCars() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const [selectedMake, setSelectedMake] = useState<string | null>(null);

  const { isLoading: isMakesLoading, data: existedMakes = [] } = useQuery({
    queryKey: [EXIST_CAR_MAKES_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchExistedMakes(rentalityContracts),
  });

  const { isLoading: isModelsLoading, data: existedModels = [] } = useQuery({
    queryKey: [EXIST_CAR_MODELS_QUERY_KEY, rentalityContracts, selectedMake, ethereumInfo?.walletAddress],
    queryFn: async () => fetchExistedModels(rentalityContracts, selectedMake),
    enabled: !!selectedMake && !isEmpty(selectedMake),
  });

  return { existedMakes, existedModels, selectedMake, setSelectedMake, isLoading: isMakesLoading || isModelsLoading };
}

async function fetchExistedMakes(rentalityContracts: IRentalityContracts | null | undefined) {
  if (!rentalityContracts) {
    throw new Error("Contracts not initialized");
  }
  const result = await rentalityContracts.gateway.getUniqCarsBrand();

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.value;
}

async function fetchExistedModels(
  rentalityContracts: IRentalityContracts | null | undefined,
  selectedMake: string | null
) {
  if (!rentalityContracts) {
    throw new Error("Contracts not initialized");
  }
  if (isEmpty(selectedMake) || selectedMake === null) {
    throw new Error("selectedMake is null");
  }

  const result = await rentalityContracts.gateway.getUniqModelsByBrand(selectedMake);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.value;
}

export default useFetchExistPlatformCars;
