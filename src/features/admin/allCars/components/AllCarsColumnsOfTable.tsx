import { TFunction } from "@/utils/i18n";
import { VinInfo } from "@/pages/api/car-api/vinInfo";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { AdminCarDetails } from "@/features/admin/allCars/models";
import Image from "next/image";
import { RntTableHeaderSorting } from "@/components/table/rntTable";
import { formatAddress } from "@/utils/addressFormatters";
import { VinNumberCell } from "@/features/admin/allCars/components/AllCarsVinNumberCell";
import * as React from "react";

export default function GetColumnsForAllCarsTable(
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
