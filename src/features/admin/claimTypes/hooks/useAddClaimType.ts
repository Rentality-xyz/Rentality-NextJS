
import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { logger } from "@/utils/logger";
import { ClaimUsers } from "../models/claims";


function useAddClaimType() {
  const { admin } = useRentalityAdmin();
const addClaimType = async (claimName: string, forUsers: ClaimUsers): Promise<Result<boolean, string>> => {

  if (!admin) {
    logger.error("fetchData error: rentalityAdminGateway is null");
    return Err("Contract is not initialized");
  }
  try {
    const result = await admin.addClaimType(claimName, BigInt(forUsers));
    if (result.ok) {
      return Ok(true);
    } else {
      throw Err(result.error);
    }
  } catch (error) {
    logger.error("addClaimType error:", error);
    return Err("Error adding claim type");
  }

}
return {
    addClaimType
}
}

export default useAddClaimType;
