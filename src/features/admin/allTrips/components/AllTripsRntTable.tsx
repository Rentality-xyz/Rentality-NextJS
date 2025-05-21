import * as React from "react";
import { useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  RntTable,
  RntTableBody,
  RntTableCell,
  RntTableFooter,
  RntTableHead,
  RntTableHeader,
  RntTableHeaderSorting,
  RntTableRow,
} from "@/components/table/rntTable";
import {
  AdminTripDetails,
  getPaymentStatusText,
  getTripStatusTextFromAdminStatus,
} from "@/features/admin/allTrips/models/AdminTripDetails";
import { Result } from "@/model/utils/result";
import { TFunction } from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import {
  getAdminTextColorForPaymentStatus,
  getAdminTripStatusBgColorFromStatus,
} from "@/features/admin/allTrips/utils/tailwind";
import { cn } from "@/utils";
import { isEmpty } from "@/utils/string";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { PaymentStatus } from "@/model/blockchain/schemas";
import RntButton from "@/components/common/rntButton";
import { displayMoneyWith2DigitsOrNa } from "@/utils/numericFormatters";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RntDropdownMenuCheckbox from "@/components/common/RntDropdownMenuCheckbox";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import useAdminAllTrips, {
  AdminAllTripsFilters,
  getAllAdminTrips,
} from "@/features/admin/allTrips/hooks/useAdminAllTrips";
import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { exportToExcel } from "@/utils/exportToExcel";
import GetColumnsForAllTripsTable from "@/features/admin/allTrips/components/AllTripsColumnsOfTable";

type AllTripsRntTableProps = {
  isLoading: boolean;
  data: AdminTripDetails[];
  filters: AdminAllTripsFilters;
  payToHost: (tripId: number) => Promise<Result<boolean, string>>;
  refundToGuest: (tripId: number) => Promise<Result<boolean, string>>;
};

export function AllTripsRntTable({ isLoading, data, filters, payToHost, refundToGuest }: AllTripsRntTableProps) {
  const { t } = useTranslation();
  const t_att: TFunction = (name, options) => {
    return t("all_trips_table." + name, options);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useRntSnackbars();
  const pathname = usePathname();

  const columns = GetColumnsForAllTripsTable(
    t,
    t_att,
    isSubmitting,
    setIsSubmitting,
    showError,
    pathname,
    payToHost,
    refundToGuest
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { admin } = useRentalityAdmin();

  async function handleExportToExcel() {
    const allTrips = await getAllAdminTrips(admin, filters);
    exportToExcel(allTrips, columns, "AllTripsTable.xlsx");
  }

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <RntDropdownMenuCheckbox
          containerClassName="w-full sm:w-60"
          id={t("admin.columns")}
          placeholder={t("admin.columns")}
        >
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <RntDropdownMenuCheckbox.Option
                  key={column.id}
                  value={column.id}
                  isChecked={column.getIsVisible()}
                  onCheckedChange={() => column.toggleVisibility(!column.getIsVisible())}
                >
                  {column.id}
                </RntDropdownMenuCheckbox.Option>
              );
            })}
        </RntDropdownMenuCheckbox>
        <RntButton className="w-full sm:w-60" onClick={handleExportToExcel}>
          {t("common.export_to_excel")}
        </RntButton>
      </div>
      <ScrollingHorizontally>
        <RntInputTransparent
          placeholder={`Filter ${t_att("tripId")}...`}
          value={(table.getColumn(t_att("tripId"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("tripId"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("vehicle")}...`}
          value={(table.getColumn(t_att("vehicle"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("vehicle"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("plateNumber")}...`}
          value={(table.getColumn(t_att("plateNumber"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("plateNumber"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("promoCode")}...`}
          value={(table.getColumn(t_att("promoCode"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("promoCode"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("host")}...`}
          value={(table.getColumn(t_att("host"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("host"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("guest")}...`}
          value={(table.getColumn(t_att("guest"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("guest"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
      </ScrollingHorizontally>
      <RntTable>
        <RntTableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <RntTableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <RntTableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </RntTableHead>
                );
              })}
            </RntTableRow>
          ))}
        </RntTableHeader>
        <RntTableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <RntTableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <RntTableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</RntTableCell>
                ))}
              </RntTableRow>
            ))
          ) : (
            <RntTableRow>
              <RntTableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </RntTableCell>
            </RntTableRow>
          )}
        </RntTableBody>
        <RntTableFooter className="h-9">
          {table.getFooterGroups().map((footerGroup) => (
            <RntTableRow key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <RntTableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </RntTableHead>
              ))}
            </RntTableRow>
          ))}
        </RntTableFooter>
      </RntTable>
    </RntSuspense>
  );
}
