import Image from "next/image";
import React from "react";
import { cn } from "@/utils";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { PointsFromYourReferralsInfo } from "../hooks/useFetchPointsFromYourReferrals";

type PointsFromYourReferralsTableProps = {
  isLoading: boolean;
  data: PointsFromYourReferralsInfo[];
};

export default function PointsFromYourReferralsTable({ isLoading, data }: PointsFromYourReferralsTableProps) {
  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12";

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
      <table className="mt-8 w-full table-auto border-spacing-2">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={headerSpanClassName}></th>
            <th className={cn("text-gray-400", headerSpanClassName)}>Total referrals</th>
            <th className={cn("text-gray-400", headerSpanClassName)}>Total received</th>
            <th className={headerSpanClassName}>Ready to claim</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((entry, index) => (
            <tr key={index} className="border-b-[2px] border-b-gray-500">
              <td className={rowSpanClassName}>{entry.methodDescriptions || "Description"}</td>
              <td className={cn("text-center text-gray-400", rowSpanClassName)}>{entry.totalReferrals}</td>
              <td className={cn("text-center text-gray-400", rowSpanClassName)}>{entry.totalReceived}</td>
              <td className={cn("flex items-center justify-center", rowSpanClassName)}>
                {entry.readyToClaim}
                <Image src={"/images/icons/ic_star_points_yellow.svg"} width={47} height={47} alt="" className="ml-1 h-[22px] w-[22px] lg:ml-4" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </RntSuspense>
  );
}
