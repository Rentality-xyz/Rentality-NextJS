import { useRentality } from "@/contexts/rentalityContext";
import { validateContractCheckPromoDTO } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { bigIntReplacer } from "@/utils/json";
import { useCallback } from "react";

function useCheckPromo() {
  const { rentalityContracts } = useRentality();

  const checkPromo = useCallback(
    async (code: string): Promise<Result<{ value: number }, Error>> => {
      if (!rentalityContracts) {
        console.error("fetchData error: rentalityContract is null");
        return Err(new Error("Contract is not initialized"));
      }

      try {
        const checkPromoDto = await rentalityContracts.gateway.checkPromo(code);
        validateContractCheckPromoDTO(checkPromoDto);

        console.debug("checkPromoDto", JSON.stringify(checkPromoDto, bigIntReplacer, 2));

        if (!checkPromoDto.isFound) {
          return Err(new Error("Promo is not found"));
        }
        if (!checkPromoDto.isValid) {
          return Err(new Error("Promo is not valid"));
        }

        return Ok({ value: Number(checkPromoDto.value) });
      } catch (error) {
        return Err(new Error("checkPromo erro: " + error));
      }
    },
    [rentalityContracts]
  );

  return { checkPromo } as const;
}

export default useCheckPromo;