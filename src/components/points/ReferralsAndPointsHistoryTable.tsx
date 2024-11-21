import React, { useEffect, useState } from "react";
import { cn } from "@/utils";
import Loading from "@/components/common/Loading";
import RntSuspense from "../common/rntSuspense";
import { RefferalHistory, RefferalProgram } from "@/model/blockchain/schemas";
import { useTranslation } from "react-i18next";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { ReferralHistoryInfo } from "@/hooks/points/usePointsHistory";

type ReferralsAndPointsHistoryTableProps = {
  isLoading: boolean;
  data: ReferralHistoryInfo[];
};

export default function ReferralsAndPointsHistoryTable({ isLoading, data }: ReferralsAndPointsHistoryTableProps) {
  const { t } = useTranslation();
  const ReferralProgramDescriptions: { [key in RefferalProgram]: string } = {
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
  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 w-1/3";

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
      <table className="mt-4 w-full table-auto border-spacing-2">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={headerSpanClassName}></th>
            <th className={cn("text-gray-400", headerSpanClassName)}>Date</th>
            <th className={headerSpanClassName}>Points</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((entry, index) => (
            <tr key={index} className="border-b-[2px] border-b-gray-500">
              <td className={rowSpanClassName}>{ReferralProgramDescriptions[entry.method] || "Description"}</td>
              <td className={cn("text-center text-gray-400", rowSpanClassName)}>
                {dateFormatShortMonthDateTime(entry.date, UTC_TIME_ZONE_ID)}
              </td>
              <td className={cn("text-center", rowSpanClassName, entry.points > 0 ? "text-white" : "text-red-500")}>
                {entry.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </RntSuspense>
  );
}
