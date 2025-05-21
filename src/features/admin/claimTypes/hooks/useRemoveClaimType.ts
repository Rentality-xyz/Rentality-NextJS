
import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { logger } from "@/utils/logger";


function useRemoveClaimType() {
  const { admin } = useRentalityAdmin();
const removeClaimType = async (claimTypeId: number): Promise<Result<boolean, string>> => {

  if (!admin) {
    logger.error("fetchData error: rentalityAdminGateway is null");
    return Err("Contract is not initialized");
  }
  try {
    const result = await admin.removeClaimType(claimTypeId);
    if (result.ok) {
      return Ok(true);
    } else {
      throw Err(result.error);
    }
  } catch (error) {
    logger.error("removeClaimType error:", error);
    return Err("Error removing claim type");
  }

}
return {
  removeClaimType
}
}

export default useRemoveClaimType;
