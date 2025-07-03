import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { validateContractAdminKYCInfoDTO } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { bigIntReplacer } from "@/utils/json";
import { useCallback, useState } from "react";
import { logger } from "@/utils/logger";
import { ClaimType, ClaimUsers, mapContractClaimTypeToClaimType } from "../models/claims";
import { ContractClaimTypeV2 } from "@/model/blockchain/schemas";

const filterUniqueClaims = (claims: ClaimType[]): ClaimType[] => {
    return claims.reduce((unique: ClaimType[], item) => {
      if (!unique.some(entry => entry.claimTypeId === item.claimTypeId)) {
        unique.push(item);
      }
      return unique;
    }, []);
  };

export interface ClaimTypesFilters {
  claimTypes?: ClaimUsers;
}

function useAdminClaimTypes() {
  const { admin } = useRentalityAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ClaimType[]>([]);

  const fetchData = useCallback(
    async (
      filters?: ClaimTypesFilters,
    ): Promise<Result<boolean, string>> => {
      if (!admin) {
        logger.error("fetchData error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      setIsLoading(true);
      logger.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

      let claimsResult = [] as ContractClaimTypeV2[];
      try {
      if (filters) {
        const isHost = filters.claimTypes === ClaimUsers.Host;
        const result = await admin.getAllClaimTypes(isHost); 



        if((isHost || filters.claimTypes === ClaimUsers.Guest) && result.ok) {
            claimsResult = result.value;
        } 
        else if(result.ok) {  
            claimsResult = result.value;
            const guestResult = await admin.getAllClaimTypes(true);
            if(guestResult.ok) {
                claimsResult = claimsResult.concat(guestResult.value);
            }     
        }
    }
    else {
        const guestResult = await admin.getAllClaimTypes(false);
        if(guestResult.ok) {
            claimsResult = guestResult.value;
        }
        const hostResult = await admin.getAllClaimTypes(true);
        if(hostResult.ok) {
            claimsResult = claimsResult.concat(hostResult.value);
        }

    }

        const data = claimsResult.map(mapContractClaimTypeToClaimType);
     
        setData(filterUniqueClaims(data));

        setIsLoading(false);
        return Ok(true);
      } catch {
        setIsLoading(false);
        return Err("Get data error. See logs for more details");
      }
    },
    [admin]
  );

  return {
    isLoading,
    data: { data: data.sort((a, b) => a.claimTypeId - b.claimTypeId)},
    fetchData,
  } as const;
}

export default useAdminClaimTypes;
