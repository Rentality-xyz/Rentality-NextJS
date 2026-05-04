import { getEtherContractWithProvider } from "@/abis";
import getDefaultProvider from "@/utils/api/defaultProviderUrl";
import { isEmpty } from "@/utils/string";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const EXIST_CAR_MAKES_QUERY_KEY = "ExistCarMakes";
export const EXIST_CAR_MODELS_QUERY_KEY = "ExistCarModels";

function useFetchExistPlatformCars() {
  const [selectedMake, setSelectedMake] = useState<string | null>(null);

  const { isLoading: isMakesLoading, data: existedMakes = [] } = useQuery({
    queryKey: [EXIST_CAR_MAKES_QUERY_KEY],
    queryFn: fetchExistedMakes,
  });

  const { isLoading: isModelsLoading, data: existedModels = [] } = useQuery({
    queryKey: [EXIST_CAR_MODELS_QUERY_KEY, selectedMake],
    queryFn: async () => fetchExistedModels(selectedMake),
    enabled: !!selectedMake && !isEmpty(selectedMake),
  });

  return { existedMakes, existedModels, selectedMake, setSelectedMake, isLoading: isMakesLoading || isModelsLoading };
}

async function fetchExistedMakes() {
  const provider = await getDefaultProvider();
  const gateway = await getEtherContractWithProvider("gateway", provider);

  if (!gateway) {
    throw new Error("Gateway contract not initialized");
  }

  return (await gateway.getUniqCarsBrand()) as string[];
}

async function fetchExistedModels(selectedMake: string | null) {
  if (isEmpty(selectedMake) || selectedMake === null) {
    throw new Error("selectedMake is null");
  }

  const provider = await getDefaultProvider();
  const gateway = await getEtherContractWithProvider("gateway", provider);

  if (!gateway) {
    throw new Error("Gateway contract not initialized");
  }

  return (await gateway.getUniqModelsByBrand(selectedMake)) as string[];
}

export default useFetchExistPlatformCars;
