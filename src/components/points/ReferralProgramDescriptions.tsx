import { RefferalProgram } from "@/model/blockchain/schemas";
import { TFunction } from "i18next";

export const ReferralProgramDescription = (t: TFunction, program: RefferalProgram): string => {
  const descriptions: { [key in RefferalProgram]: string } = {
    [RefferalProgram.SetKYC]: t("referrals_and_point.referral_program.set_kyc"),
    [RefferalProgram.PassCivic]: t("referrals_and_point.referral_program.pass_civic"),
    [RefferalProgram.AddFirstCar]: t("referrals_and_point.referral_program.add_first_car"),
    [RefferalProgram.AddCar]: t("referrals_and_point.referral_program.add_car"),
    [RefferalProgram.CreateTrip]: t("referrals_and_point.referral_program.create_trip"),
    [RefferalProgram.FinishTripAsHost]: t("referrals_and_point.referral_program.finish_trip_as_host"),
    [RefferalProgram.FinishTripAsGuest]: t("referrals_and_point.referral_program.finish_trip_as_guest"),
    [RefferalProgram.UnlistedCar]: t("referrals_and_point.referral_program.unlisted_car"),
    [RefferalProgram.Daily]: t("referrals_and_point.referral_program.daily"),
    [RefferalProgram.DailyListing]: t("referrals_and_point.referral_program.daily_listing"),
  };

  return descriptions[program];
};
