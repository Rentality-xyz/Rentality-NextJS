import { RefferalProgram as ReferralProgram } from "@/model/blockchain/schemas";
import { TFunction } from "i18next";

export const ReferralProgramDescription = (t: TFunction, program: ReferralProgram): string => {
  switch (program) {
    case ReferralProgram.SetKYC:
      return t("referrals_and_point.referral_program.set_kyc");
    case ReferralProgram.PassCivic:
      return t("referrals_and_point.referral_program.pass_civic");
    case ReferralProgram.AddFirstCar:
      return t("referrals_and_point.referral_program.add_first_car");
    case ReferralProgram.AddCar:
      return t("referrals_and_point.referral_program.add_car");
    case ReferralProgram.CreateTrip:
      return t("referrals_and_point.referral_program.create_trip");
    case ReferralProgram.FinishTripAsHost:
      return t("referrals_and_point.referral_program.finish_trip_as_host");
    case ReferralProgram.FinishTripAsGuest:
      return t("referrals_and_point.referral_program.finish_trip_as_guest");
    case ReferralProgram.UnlistedCar:
      return t("referrals_and_point.referral_program.unlisted_car");
    case ReferralProgram.Daily:
      return t("referrals_and_point.referral_program.daily");
    case ReferralProgram.DailyListing:
      return t("referrals_and_point.referral_program.daily_listing");
    default:
      return "";
  }
};
