import Image from "next/image";
import icStarPointsYellow from "@/images/ic_star_points_yellow.svg";
import React from "react";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import { cn } from "@/utils";

type ReferralsAndPointsFromYourReferralsTableProps = {
  isLoading: boolean;
  data: TransactionHistoryInfo[];
  isHost: boolean;
};

export default function ReferralsAndPointsFromYourReferralsTable({
  isLoading,
  data,
  isHost,
}: ReferralsAndPointsFromYourReferralsTableProps) {
  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  return (
    <table className="mt-8 w-full table-auto border-spacing-2 max-lg:hidden">
      <thead className="mb-2">
        <tr className="border-b-[2px] border-b-gray-500">
          <th className={headerSpanClassName}></th>
          <th className={cn("text-gray-400", headerSpanClassName)}>Total referrals</th>
          <th className={cn("text-gray-400", headerSpanClassName)}>Total received</th>
          <th className={headerSpanClassName}>Ready to claim</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {Array.from({
          length: 4,
          // currentPage === 0
          //   ? Math.min(itemsPerPage, transactions.length)
          //   : Math.max(0, transactions.length - currentPage * itemsPerPage),
        }).map((_, index) => {
          // const itemNumber = currentPage * itemsPerPage + index;

          return (
            <tr /*{key={transactions[itemNumber].transHistoryId}}*/ className="border-b-[2px] border-b-gray-500">
              {/*<td className={rowSpanClassName}>{transactions[itemNumber].car}</td>*/}
              <td className={rowSpanClassName}>Save profile</td>
              <td className={cn("text-gray-400", rowSpanClassName)}>4</td>
              <td className={cn("text-gray-400", rowSpanClassName)}>400</td>
              <td className={cn("flex items-center justify-center", rowSpanClassName)}>
                100
                <Image src={icStarPointsYellow} alt="" className="ml-1 h-[22px]" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
