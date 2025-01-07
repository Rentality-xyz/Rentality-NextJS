import { RefferalAccrualType, RefferalProgram, Tear } from "@/model/blockchain/schemas";
import { useRentalityAdmin } from "@/contexts/rentalityContext";

const useInviteLink = () => {
  const { admin } = useRentalityAdmin();

  const manageRefferalBonusAccrual = async (
    accrualType: RefferalAccrualType,
    program: RefferalProgram,
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

  const manageRefferalDiscount = async (program: RefferalProgram, tear: Tear, points: number, percents: number) => {
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
    manageRefferalDiscount,
    manageTearInfo,
  } as const;
};

export default useInviteLink;
