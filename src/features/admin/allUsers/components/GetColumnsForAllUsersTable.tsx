import { TFunction } from "@/utils/i18n";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { AdminCarDetails } from "@/features/admin/allCars/models";
import Image from "next/image";
import { RntTableHeaderSorting } from "@/components/table/rntTable";
import { formatAddress } from "@/utils/addressFormatters";
import { VinNumberCell } from "@/features/admin/allCars/components/AllCarsVinNumberCell";
import * as React from "react";
import { AdminUserDetails } from "@/features/admin/allUsers/models";
import Link from "next/link";
import { Avatar } from "@mui/material";
import { dateFormatLongMonthYearDateTime, dateFormatShortMonthDateYear } from "@/utils/datetimeFormatters";

export default function GetColumnsForAllUsersTable(t_att: TFunction): ColumnDef<AdminUserDetails, any>[] {
  const columnHelper = createColumnHelper<AdminUserDetails>();

  return [
    columnHelper.accessor((row) => row.TCSignature, {
      id: t_att("avatar"),
      header: () => t_att("avatar"),
      cell: (info) => {
        return (
          <Avatar className="my-2" src={info.row.original.profilePhoto} sx={{ width: "3rem", height: "3rem" }}></Avatar>
        );
      },
    }),

    columnHelper.accessor((row) => row.walletAddress, {
      id: t_att("wallet"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("wallet")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        return <>{formatAddress(info.getValue(), 5, 4)}</>;
      },
    }),

    columnHelper.accessor((row) => dateFormatLongMonthYearDateTime(row.createDate), {
      id: t_att("profile-creation-date"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[19ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("profile-creation-date")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.name, {
      id: t_att("nickname"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[10ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("nickname")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.issueCountry, {
      id: t_att("issue-country"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="h-16 min-w-[8ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("issue-country")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.mobilePhoneNumber, {
      id: t_att("phone-number"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[19ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("phone-number")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.surname, {
      id: t_att("name"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("name")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.email, {
      id: t_att("e-mail"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("e-mail")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.licenseNumber, {
      id: t_att("driving-license-number"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="h-16 min-w-[10ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("driving-license-number")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => dateFormatShortMonthDateYear(row.expirationDate), {
      id: t_att("driving-license-validity-period"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[19ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("driving-license-validity-period")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row, {
      id: t_att("cars-in-listing"),
      header: () => {
        return <div className="min-w-[12ch]">{t_att("cars-in-listing")}</div>;
      },
      cell: (info) => {
        const row = info.getValue();
        const listingLink = `/hosts/${row.walletAddress}`;
        return (
          <Link href={listingLink}>
            <span className="text-rentality-secondary">{t_att("see_listing")}</span>
          </Link>
        );
      },
    }),
  ];
}
