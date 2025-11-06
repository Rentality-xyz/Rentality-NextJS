import React from "react";
import Link from "next/link";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { TFunction } from "@/utils/i18n";
import { useTranslation } from "react-i18next";
import { Avatar } from "@mui/material";
import { dateFormatLongMonthYearDateTime, dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { AdminUserDetails } from "../models";
import { formatAddress } from "@/utils/addressFormatters";
import RntDropdownMenuCheckbox from "@/components/common/RntDropdownMenuCheckbox";
import RntButton from "@/components/common/rntButton";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";
import RntInputTransparent from "@/components/common/rntInputTransparent";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import GetColumnsForAllUsersTable from "@/features/admin/allUsers/components/GetColumnsForAllUsersTable";
import {
  RntTable,
  RntTableBody,
  RntTableCell,
  RntTableHead,
  RntTableHeader,
  RntTableRow,
} from "@/components/table/rntTable";

interface AllUsersRntTableProps {
  isLoading: boolean;
  data: AdminUserDetails[];
}

function AllUsersRntTable({ isLoading, data }: AllUsersRntTableProps) {
  const { t } = useTranslation();

  const t_att: TFunction = (name, options) => {
    return t("admin_all_users." + name, options);
  };

  const columns = GetColumnsForAllUsersTable(t_att);

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
      <ScrollingHorizontally>
        <RntInputTransparent
          placeholder={`Filter ${t_att("wallet")}...`}
          value={(table.getColumn(t_att("wallet"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("wallet"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("nickname")}...`}
          value={(table.getColumn(t_att("nickname"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("nickname"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("issue-country")}...`}
          value={(table.getColumn(t_att("issue-country"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("issue-country"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("phone-number")}...`}
          value={(table.getColumn(t_att("phone-number"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("phone-number"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("name")}...`}
          value={(table.getColumn(t_att("name"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("name"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("e-mail")}...`}
          value={(table.getColumn(t_att("e-mail"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("e-mail"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-60"
        />
        <RntInputTransparent
          placeholder={`Filter ${t_att("driving-license-number")}...`}
          value={(table.getColumn(t_att("driving-license-number"))?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn(t_att("driving-license-number"))?.setFilterValue(event.target.value)}
          wrapperClassName="w-72"
        />
      </ScrollingHorizontally>
      <RntTable>
        <RntTableHeader className="h-20">
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

export default AllUsersRntTable;
