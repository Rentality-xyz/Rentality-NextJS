import { RefferalProgram as ReferralProgram, Tear } from "@/model/blockchain/schemas";
import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { logger } from "@/utils/logger";

function useRefferalProgramAdmin() {
  const { admin } = useRentalityAdmin();

  const manageReferralDiscount = async (program: ReferralProgram, tear: Tear, points: number, percents: number) => {
    if (!admin) {
      logger.error("get hash error: rentalityAdminContract is null");
      return null;
    }

    const result = await admin.manageRefferalDiscount(program, tear, points, percents);
    return result.ok ? result.value : null;
  };

  const manageTearInfo = async (tear: Tear, from: number, to: number) => {
    if (!admin) {
      logger.error("get hash error: rentalityAdminContract is null");
      return null;
    }

    const result = await admin.manageTearInfo(tear, from, to);
    return result.ok ? result.value : null;
  };

  return {
    manageReferralDiscount,
    manageTearInfo,
  } as const;
}

export default useRefferalProgramAdmin;
