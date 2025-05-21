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
import Image from "next/image";
import { formatAddress } from "@/utils/addressFormatters";
import { VinNumberCell } from "@/features/admin/allCars/components/AllCarsVinNumberCell";

type AllCarsTableProps = {
  isLoading: boolean;
  data: AdminCarDetails[];
  checkVin: (vin: string) => Promise<VinInfo | undefined>;
};

export default function AllCarsRntTable({ isLoading, data, checkVin }: AllCarsTableProps) {
  const { t } = useTranslation();

  const t_comp: TFunction = (name, options) => {
    return t("admin_all_cars." + name, options);
  };

  const columns = GetColumns(t, t_comp, checkVin);

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
      <div className="flex flex-col gap-4 sm:flex-row">
        <RntDropdownMenuCheckbox
          containerClassName="w-full sm:w-60"
          id={t("admin.columns")}
          placeholder={t("admin.columns")}
        >
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide() && column.id !== t_comp("carId"))
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
      </div>
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

function GetColumns(
  t: TFunction,
  t_comp: TFunction,
  checkVin: (vin: string) => Promise<VinInfo | undefined>
): ColumnDef<AdminCarDetails, any>[] {
  const columnHelper = createColumnHelper<AdminCarDetails>();

  return [
    // columnHelper.accessor((row) => row.carId, {
    //   id: t_comp("carId"),
    //   header: ({ column }) => {
    //     return (
    //       <RntTableHeaderSorting
    //         className="min-w-[6ch]"
    //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //       >
    //         {t_comp("carId")}
    //       </RntTableHeaderSorting>
    //     );
    //   },
    // }),

    columnHelper.accessor((row) => row, {
      id: t_comp("image"),
      header: () => t_comp("image"),
      cell: (info) => {
        return (
          <Image src={info.row.original.carPhotoUrl} alt="" width={150} height={100} className="object-cover py-2" />
        );
      },
    }),

    columnHelper.accessor((row) => row.hostName, {
      id: t_comp("host"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_comp("host")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        const hostAddress = info.row.original.hostAddress;
        return (
          <>
            <div>{info.getValue()}</div>
            <div>{formatAddress(hostAddress, 5, 4)}</div>
          </>
        );
      },
    }),

    columnHelper.accessor((row) => row.isListed, {
      id: t_comp("status"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[10ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_comp("status")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        return <div>{info.getValue() ? t("vehicles.listed") : t("vehicles.unlisted")}</div>;
      },
    }),

    columnHelper.accessor((row) => row, {
      id: t_comp("country"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[25ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {`${t_comp("country")} / ${t_comp("state")}`}
            <br />
            {t_comp("city")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        const country = info.row.original.country;
        const state = info.row.original.state;
        const city = info.row.original.city;

        return (
          <>
            <div>{`${country} / ${state}`}</div>
            <div>{city}</div>
          </>
        );
      },
    }),

    columnHelper.accessor((row) => row, {
      id: t_comp("timeZoneId"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="h-16 min-w-[20ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_comp("latitude")}
            <br />
            {t_comp("longitude")}
            <br />
            {t_comp("timeZoneId")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        const isUniue = info.row.original.isUniue;
        const latitude = info.row.original.locationLatitude;
        const longitude = info.row.original.locationLongitude;
        const timeZoneId = info.row.original.timeZoneId;

        return (
          <>
            <div className={`${isUniue ? "" : "text-rentality-alert-text"}`}>{latitude}</div>
            <div className={`${isUniue ? "" : "text-rentality-alert-text"}`}>{longitude}</div>
            <div>{timeZoneId}</div>
          </>
        );
      },
    }),

    columnHelper.accessor((row) => row.userAddress, {
      id: t_comp("homeAddress"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[20ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_comp("homeAddress")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        const isUserAddressFull = info.row.original.isUserAddressFull;
        return <div className={`${isUserAddressFull ? "" : "text-rentality-alert-text"}`}>{info.getValue()}</div>;
      },
    }),

    columnHelper.accessor((row) => row, {
      id: t_comp("checkVin"),
      header: () => t_comp("checkVin"),
      cell: (info) => {
        const vinNumber = info.row.original.vinNumber;
        return <VinNumberCell vinNumber={vinNumber} checkVin={checkVin} t={t} />;
      },
    }),
  ];
}
