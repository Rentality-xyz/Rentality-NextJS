import { RefferalProgram } from "@/model/blockchain/schemas";
import { TFunction } from "i18next";

export const ReferralProgramDescription = (t: TFunction, program: RefferalProgram): string => {
  switch (program) {
    case RefferalProgram.SetKYC:
      return t("referrals_and_point.referral_program.set_kyc");
    case RefferalProgram.PassCivic:
      return t("referrals_and_point.referral_program.pass_civic");
    case RefferalProgram.AddFirstCar:
      return t("referrals_and_point.referral_program.add_first_car");
    case RefferalProgram.AddCar:
      return t("referrals_and_point.referral_program.add_car");
    case RefferalProgram.CreateTrip:
      return t("referrals_and_point.referral_program.create_trip");
    case RefferalProgram.FinishTripAsHost:
      return t("referrals_and_point.referral_program.finish_trip_as_host");
    case RefferalProgram.FinishTripAsGuest:
      return t("referrals_and_point.referral_program.finish_trip_as_guest");
    case RefferalProgram.UnlistedCar:
      return t("referrals_and_point.referral_program.unlisted_car");
    case RefferalProgram.Daily:
      return t("referrals_and_point.referral_program.daily");
    case RefferalProgram.DailyListing:
      return t("referrals_and_point.referral_program.daily_listing");
    default:
      return "";
  }
};
