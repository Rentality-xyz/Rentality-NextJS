import React from "react";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import { cn } from "@/utils";

type ReferralsAndPointsHistoryTableProps = {
  isLoading: boolean;
  data: TransactionHistoryInfo[];
  isHost: boolean;
};

export default function ReferralsAndPointsHistoryTable({
  isLoading,
  data,
  isHost,
}: ReferralsAndPointsHistoryTableProps) {
  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  return (
    <table className="mt-4 w-full table-auto border-spacing-2 max-lg:hidden">
      <thead className="mb-2">
        <tr className="border-b-[2px] border-b-gray-500">
          <th className={headerSpanClassName}></th>
          <th className={cn("text-gray-400", headerSpanClassName)}>Date</th>
          <th className={headerSpanClassName}>Points</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {Array.from({
          length: 3,
          // currentPage === 0
          //   ? Math.min(itemsPerPage, transactions.length)
          //   : Math.max(0, transactions.length - currentPage * itemsPerPage),
        }).map((_, index) => {
          // const itemNumber = currentPage * itemsPerPage + index;

          return (
            <tr /*{key={transactions[itemNumber].transHistoryId}}*/ className="border-b-[2px] border-b-gray-500">
              {/*<td className={rowSpanClassName}>{transactions[itemNumber].car}</td>*/}
              <td className={rowSpanClassName}>Listing first car</td>
              <td className={cn("text-gray-400", rowSpanClassName)}>01.10.2024 15:44</td>
              <td className={rowSpanClassName}>+ 1000</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
