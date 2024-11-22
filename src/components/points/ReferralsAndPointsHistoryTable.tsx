import React, { useEffect, useState } from "react";
import { cn } from "@/utils";
import Loading from "@/components/common/Loading";
import RntSuspense from "../common/rntSuspense";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { ReferralHistoryInfo } from "@/hooks/points/usePointsHistory";

type ReferralsAndPointsHistoryTableProps = {
  isLoading: boolean;
  data: ReferralHistoryInfo[];
};

export default function ReferralsAndPointsHistoryTable({ isLoading, data }: ReferralsAndPointsHistoryTableProps) {
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
              <td className={rowSpanClassName}>{entry.methodDescriptions || "Description"}</td>
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
