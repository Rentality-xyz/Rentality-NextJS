import { TFunction } from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { VinInfo } from "@/pages/api/car-api/vinInfo";
import { AdminCarDetails } from "../models";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import {
  RntTable,
  RntTableBody,
  RntTableCell,
  RntTableHead,
  RntTableHeader,
  RntTableHeaderSorting,
  RntTableRow,
} from "@/components/table/rntTable";
import RntDropdownMenuCheckbox from "@/components/common/RntDropdownMenuCheckbox";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import GetColumnsForAllCarsTable from "@/features/admin/allCars/components/AllCarsColumnsOfTable";

type AllCarsRntTableProps = {
  isLoading: boolean;
  data: AdminCarDetails[];
  checkVin: (vin: string) => Promise<VinInfo | undefined>;
};

export default function AllCarsRntTable({ isLoading, data, checkVin }: AllCarsRntTableProps) {
  const { t } = useTranslation();

  const t_comp: TFunction = (name, options) => {
    return t("admin_all_cars." + name, options);
  };

  const columns = GetColumnsForAllCarsTable(t, t_comp, checkVin);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
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
      <RntInputTransparent
        placeholder={`Filter ${t_comp("host")}...`}
        value={(table.getColumn(t_comp("host"))?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn(t_comp("host"))?.setFilterValue(event.target.value)}
        wrapperClassName="w-full sm:w-60"
      />
      <RntTable>
        <RntTableHeader className="h-16">
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
      </RntTable>
    </RntSuspense>
  );
}
