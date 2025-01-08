import {
  RefferalAccrualType as ReferralAccrualType,
  RefferalProgram as ReferralProgram,
  Tear,
} from "@/model/blockchain/schemas";
import { useRentalityAdmin } from "@/contexts/rentalityContext";

const useInviteLink = () => {
  const { admin } = useRentalityAdmin();

  const manageReferralBonusAccrual = async (
    accrualType: ReferralAccrualType,
    program: ReferralProgram,
    points: number,
    pointsWithReffHash: number
  ) => {
    if (!admin) {
      console.error("get hash error: rentalityAdminContract is null");
      return null;
    }

    try {
      return await admin.manageRefferalBonusAccrual(accrualType, program, points, pointsWithReffHash);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const manageReferralDiscount = async (program: ReferralProgram, tear: Tear, points: number, percents: number) => {
    if (!admin) {
      console.error("get hash error: rentalityAdminContract is null");
      return null;
    }

    try {
      return await admin.manageRefferalDiscount(program, tear, points, percents);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  const manageTearInfo = async (tear: Tear, from: number, to: number) => {
    if (!admin) {
      console.error("get hash error: rentalityAdminContract is null");
      return null;
    }

    try {
      return await admin.manageTearInfo(tear, from, to);
    } catch (e) {
      console.error("get hash error:" + e);
      return null;
    }
  };

  return {
    manageReferralDiscount,
    manageTearInfo,
  } as const;
};

export default useInviteLink;
