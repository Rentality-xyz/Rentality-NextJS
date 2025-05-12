import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  RntTable,
  RntTableBody,
  RntTableCell,
  RntTableFooter,
  RntTableHead,
  RntTableHeader,
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
import { useState } from "react";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import { AdminTripStatus, PaymentStatus } from "@/model/blockchain/schemas";
import RntButton from "@/components/common/rntButton";
import { displayMoneyWith2DigitsOrNa } from "@/utils/numericFormatters";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RntDropdownMenuCheckbox from "@/components/common/RntDropdownMenuCheckbox";
import ScrollingHorizontally from "@/components/common/ScrollingHorizontally";
import RntInputTransparent from "@/components/common/rntInputTransparent";

type AllTripsRntTableProps = {
  isLoading: boolean;
  data: AdminTripDetails[];
  payToHost: (tripId: number) => Promise<Result<boolean, string>>;
  refundToGuest: (tripId: number) => Promise<Result<boolean, string>>;
};

export function AllTripsDataRntTable({ isLoading, data, payToHost, refundToGuest }: AllTripsRntTableProps) {
  const { t } = useTranslation();
  const t_att: TFunction = (name, options) => {
    return t("all_trips_table." + name, options);
  };

  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = GetColumns(payToHost, refundToGuest);

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
      <div className="">
        <RntDropdownMenuCheckbox
          containerClassName="w-full sm:w-40"
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
        <div className="mt-4">
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
        </div>
      </div>
      <div className="custom-scroll w-full overflow-x-auto">
        <div className="">
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
                      <RntTableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </RntTableCell>
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
        </div>
      </div>
    </RntSuspense>
  );
}

function GetColumns(
  payToHost: (tripId: number) => Promise<Result<boolean, string>>,
  refundToGuest: (tripId: number) => Promise<Result<boolean, string>>
): ColumnDef<AdminTripDetails, any>[] {
  const { t } = useTranslation();
  const t_att: TFunction = (name, options) => {
    return t("all_trips_table." + name, options);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useRntSnackbars();
  const pathname = usePathname();

  async function handlePayToHost(tripId: number) {
    setIsSubmitting(true);
    const result = await payToHost(tripId);
    if (!result.ok) {
      showError(result.error);
    }
    setIsSubmitting(false);
  }

  async function handleRefundToGuest(tripId: number) {
    setIsSubmitting(true);
    const result = await refundToGuest(tripId);
    if (!result.ok) {
      showError(result.error);
    }
    setIsSubmitting(false);
  }

  const columnHelper = createColumnHelper<AdminTripDetails>();

  return [
    columnHelper.accessor((row) => row.tripId, {
      id: t_att("tripId"),
      // header: () => <div className={`min-w-[5ch]`}>{t_att("tripId")}</div>,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {t_att("tripId")}
            <ArrowUpDown />
          </Button>
        );
      },
      filterFn: (row, columnId, filterValue: string) => {
        const value = row.getValue<number>(columnId);
        return value.toString().includes(filterValue);
      },
    }),

    columnHelper.accessor((row) => row.carDescription, {
      id: t_att("vehicle"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("vehicle")}</div>,
    }),

    columnHelper.accessor((row) => row.plateNumber, {
      id: t_att("plateNumber"),
      header: () => <div className={`min-w-[10ch]`}>{t_att("plateNumber")}</div>,
    }),

    columnHelper.accessor((row) => row.tripStatus, {
      id: t_att("tripStatus"),
      header: () => <div className={`min-w-[25ch]`}>{t_att("tripStatus")}</div>,
      cell: (info) => {
        const tripStatusBgColor = getAdminTripStatusBgColorFromStatus(info.getValue());
        return <div className={tripStatusBgColor}>{getTripStatusTextFromAdminStatus(info.getValue())}</div>;
      },
    }),

    columnHelper.accessor((row) => row.promoCode, {
      id: t_att("promoCode"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("promoCode")}</div>,
    }),

    columnHelper.accessor((row) => row, {
      id: t_att("promoCodeValue"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("promoCodeValue")}</div>,
      cell: (info) => {
        const row = info.getValue();
        const isUsedPromocode = !isEmpty(row.promoCode);
        return <span>{isUsedPromocode ? `${row.promoCodeValueInPercents}%` : ""}</span>;
      },
    }),

    columnHelper.accessor((row) => row, {
      id: t_att("promoCodeDate"),
      header: () => <div className={`min-w-[18ch]`}>{t_att("promoCodeDate")}</div>,
      cell: (info) => {
        const row = info.getValue();
        const isUsedPromocode = !isEmpty(row.promoCode);
        return (
          <span>
            {isUsedPromocode && row.promoCodeEnterDate
              ? `${dateFormatShortMonthDateTime(row.promoCodeEnterDate, row.timeZoneId)}`
              : ""}
          </span>
        );
      },
    }),

    columnHelper.accessor((row) => row, {
      id: t_att("paymentManagement"),
      header: () => t_att("paymentManagement"),
      cell: (info) => {
        const row = info.getValue();
        return (
          <>
            {row.paymentsStatus === PaymentStatus.Unpaid && (
              <div className="flex flex-col gap-2 py-2">
                <RntButton
                  className="h-8 w-52 bg-[#548235]"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handlePayToHost(row.tripId)}
                >
                  {t_att("pay_to_host")}
                </RntButton>
                <RntButton
                  className="h-8 w-52 bg-[#C55A11]"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleRefundToGuest(row.tripId)}
                >
                  {t_att("refund_to_guest")}
                </RntButton>
              </div>
            )}
          </>
        );
      },
    }),

    columnHelper.accessor((row) => row.paymentsStatus, {
      id: t_att("paymentsStatus"),
      header: () => <div className={`min-w-[17ch]`}>{t_att("paymentsStatus")}</div>,
      cell: (info) => {
        const paymentStatusTextColor = getAdminTextColorForPaymentStatus(info.getValue());
        return (
          <span className={cn("font-semibold", paymentStatusTextColor)}>{getPaymentStatusText(info.getValue())}</span>
        );
      },
    }),

    columnHelper.accessor((row) => row.hostLocation, {
      id: t_att("location"),
      header: () => <div className={`min-w-[18ch]`}>{t_att("location")}</div>,
    }),

    columnHelper.accessor((row) => row, {
      id: t_att("start"),
      header: () => <div className={`min-w-[18ch]`}>{t_att("start")}</div>,
      cell: (info) => {
        const row = info.getValue();
        return <span>{dateFormatShortMonthDateTime(row.tripStartDate, row.timeZoneId)}</span>;
      },
    }),

    columnHelper.accessor((row) => row, {
      id: t_att("end"),
      header: () => <div className={`min-w-[18ch]`}>{t_att("end")}</div>,
      cell: (info) => {
        const row = info.getValue();
        return <span>{dateFormatShortMonthDateTime(row.tripEndDate, row.timeZoneId)}</span>;
      },
    }),

    columnHelper.accessor((row) => row.tripDays, {
      id: t_att("days"),
      header: () => t_att("days"),
    }),

    columnHelper.accessor((row) => row.hostName, {
      id: t_att("host"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("host")}</div>,
    }),

    columnHelper.accessor((row) => row.guestName, {
      id: t_att("guest"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("guest")}</div>,
    }),

    columnHelper.accessor((row) => row.tripPriceBeforeDiscountInUsd, {
      id: t_att("tripPriceBeforeDiscount"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("tripPriceBeforeDiscount")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.tripDiscountInUsd, {
      id: t_att("discountAmount"),
      header: () => <div className={`min-w-[12ch]`}>{t_att("discountAmount")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.tripPriceAfterDiscountInUsd, {
      id: t_att("tripPriceAfterDiscount"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("tripPriceAfterDiscount")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.deliveryFeePickUpInUsd, {
      id: t_att("deliveryFeePickUp"),
      header: () => <div className={`min-w-[16ch]`}>{t_att("deliveryFeePickUp")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.deliveryFeeDropOffInUsd, {
      id: t_att("deliveryFeeDropOff"),
      header: () => <div className={`min-w-[16ch]`}>{t_att("deliveryFeeDropOff")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.salesTaxInUsd, {
      id: t_att("salesTax"),
      header: () => <div className={`min-w-[10ch]`}>{t_att("salesTax")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.governmentTaxInUsd, {
      id: t_att("governmentTax"),
      header: () => <div className={`min-w-[10ch]`}>{t_att("governmentTax")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.totalChargeForTripInUsd, {
      id: t_att("totalChargeForTrip"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("totalChargeForTrip")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.refundForTripInUsd, {
      id: t_att("refundForTrip"),
      header: () => <div className={`min-w-[10ch]`}>{t_att("refundForTrip")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.depositReceivedInUsd, {
      id: t_att("depositReceived"),
      header: () => <div className={`min-w-[12ch]`}>{t_att("depositReceived")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.depositReturnedInUsd, {
      id: t_att("depositReturned"),
      header: () => <div className={`min-w-[12ch]`}>{t_att("depositReturned")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.reimbursementInUsd, {
      id: t_att("reimbursement"),
      header: () => <div className={`min-w-[10ch]`}>{t_att("reimbursement")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.hostEarningsInUsd, {
      id: t_att("hostEarnings"),
      header: () => <div className={`min-w-[12ch]`}>{t_att("hostEarnings")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.platformCommissionInUsd, {
      id: t_att("platformCommission"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("platformCommission")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row, {
      id: t_att("details"),
      header: () => <div className={`min-w-[10ch]`}>{t_att("details")}</div>,
      cell: (info) => {
        const row = info.getValue();
        const detailsLink = `/admin/trips/tripInfo/${row.tripId}?back=${pathname}`;
        return (
          <Link href={detailsLink}>
            <span className="text-rentality-secondary">{t_att("details")}</span>
          </Link>
        );
      },
    }),

    columnHelper.accessor((row) => row.accruableSalesTaxInUsd, {
      id: t_att("accruableSalesTax"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("accruableSalesTax")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),

    columnHelper.accessor((row) => row.accruableGovernmentTaxInUsd, {
      id: t_att("accruableGovernmentTax"),
      header: () => <div className={`min-w-[15ch]`}>{t_att("accruableGovernmentTax")}</div>,
      cell: (info) => <span>{displayMoneyWith2DigitsOrNa(info.getValue())}</span>,
    }),
  ];
}
