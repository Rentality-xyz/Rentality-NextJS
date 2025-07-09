import { TFunction } from "@/utils/i18n";
import * as React from "react";
import { Result } from "@/model/utils/result";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  AdminTripDetails,
  getPaymentStatusText,
  getTripStatusTextFromAdminStatus,
} from "@/features/admin/allTrips/models/AdminTripDetails";
import { RntTableHeaderSorting } from "@/components/table/rntTable";
import {
  getAdminTextColorForPaymentStatus,
  getAdminTripStatusBgColorFromStatus,
} from "@/features/admin/allTrips/utils/tailwind";
import { isEmpty } from "@/utils/string";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import { PaymentStatus } from "@/model/blockchain/schemas";
import RntButton from "@/components/common/rntButton";
import { cn } from "@/utils";
import { displayMoneyWith2DigitsOrNa } from "@/utils/numericFormatters";
import Link from "next/link";

export default function GetColumnsForAllTripsTable(
  t: TFunction,
  t_att: TFunction,
  isSubmitting: boolean,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  showError: (msg: string) => void,
  pathname: string,
  payToHost: (tripId: number) => Promise<Result<boolean, string>>,
  refundToGuest: (tripId: number) => Promise<Result<boolean, string>>
): ColumnDef<AdminTripDetails, any>[] {
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
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[5ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("tripId")}
          </RntTableHeaderSorting>
        );
      },
      filterFn: (row, columnId, filterValue: string) => {
        const value = row.getValue<number>(columnId);
        return value.toString().includes(filterValue);
      },
    }),

    columnHelper.accessor((row) => row.carDescription, {
      id: t_att("vehicle"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("vehicle")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.plateNumber, {
      id: t_att("plateNumber"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[10ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("plateNumber")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor(
      (row) => getTripStatusTextFromAdminStatus(row.tripStatus), // для экспорт в Excel, будет виден текст
      {
        id: t_att("tripStatus"),
        header: ({ column }) => (
          <RntTableHeaderSorting
            className="min-w-[25ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("tripStatus")}
          </RntTableHeaderSorting>
        ),
        cell: (info) => {
          const tripStatusRaw = info.row.original.tripStatus; // для цвета
          const tripStatusText = info.getValue(); // для текста
          const tripStatusBgColor = getAdminTripStatusBgColorFromStatus(tripStatusRaw);

          return <div className={tripStatusBgColor}>{tripStatusText}</div>;
        },
      }
    ),

    columnHelper.accessor((row) => row.promoCode, {
      id: t_att("promoCode"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("promoCode")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => (!isEmpty(row.promoCode) ? `${row.promoCodeValueInPercents}%` : ""), {
      id: t_att("promoCodeValue"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("promoCodeValue")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        const row = info.getValue();
        const isUsedPromocode = !isEmpty(row.promoCode);
        return <span>{isUsedPromocode ? `${row.promoCodeValueInPercents}%` : ""}</span>;
      },
    }),

    columnHelper.accessor(
      (row) =>
        !isEmpty(row.promoCode) && row.promoCodeEnterDate
          ? dateFormatShortMonthDateTime(row.promoCodeEnterDate, row.timeZoneId)
          : "",
      {
        id: t_att("promoCodeDate"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[19ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("promoCodeDate")}
            </RntTableHeaderSorting>
          );
        },
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
      }
    ),

    columnHelper.accessor((row) => row, {
      id: t_att("paymentManagement"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {t_att("paymentManagement")}
          </RntTableHeaderSorting>
        );
      },
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

    columnHelper.accessor((row) => getPaymentStatusText(row.paymentsStatus), {
      id: t_att("paymentsStatus"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[17ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("paymentsStatus")}
          </RntTableHeaderSorting>
        );
      },
      cell: (info) => {
        const paymentsStatusRaw = info.row.original.paymentsStatus;
        const paymentsStatusText = info.getValue();
        const paymentsStatusColor = getAdminTextColorForPaymentStatus(paymentsStatusRaw);

        return <div className={cn("font-semibold", paymentsStatusColor)}>{paymentsStatusText}</div>;
      },
    }),

    columnHelper.accessor((row) => row.hostLocation, {
      id: t_att("location"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[18ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("location")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => dateFormatShortMonthDateTime(row.tripStartDate, row.timeZoneId), {
      id: t_att("start"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[18ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("start")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => dateFormatShortMonthDateTime(row.tripEndDate, row.timeZoneId), {
      id: t_att("end"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[18ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("end")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.tripDays, {
      id: t_att("days"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {t_att("days")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.hostName, {
      id: t_att("host"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("host")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor((row) => row.guestName, {
      id: t_att("guest"),
      header: ({ column }) => {
        return (
          <RntTableHeaderSorting
            className="min-w-[15ch]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t_att("guest")}
          </RntTableHeaderSorting>
        );
      },
    }),

    columnHelper.accessor(
      (row) => {
        const value = row.tripPriceBeforeDiscountInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("tripPriceBeforeDiscount"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[21ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("tripPriceBeforeDiscount")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.tripDiscountInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("discountAmount"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[15ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("discountAmount")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.tripPriceAfterDiscountInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("tripPriceAfterDiscount"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[19ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("tripPriceAfterDiscount")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.deliveryFeePickUpInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("deliveryFeePickUp"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[18ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("deliveryFeePickUp")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.deliveryFeeDropOffInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("deliveryFeeDropOff"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[20ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("deliveryFeeDropOff")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.salesTaxInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("salesTax"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[12ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("salesTax")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.governmentTaxInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("governmentTax"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[10ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("governmentTax")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.totalChargeForTripInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("totalChargeForTrip"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[17ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("totalChargeForTrip")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.refundForTripInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("refundForTrip"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[14ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("refundForTrip")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.depositReceivedInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("depositReceived"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[16ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("depositReceived")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.depositReturnedInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("depositReturned"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[16ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("depositReturned")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.reimbursementInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("reimbursement"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[10ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("reimbursement")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.hostEarningsInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("hostEarnings"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[16ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("hostEarnings")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.platformCommissionInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("platformCommission"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[18ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("platformCommission")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor((row) => row, {
      id: t_att("details"),
      header: () => t_att("details"),
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

    columnHelper.accessor(
      (row) => {
        const value = row.accruableSalesTaxInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("accruableSalesTax"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[16ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("accruableSalesTax")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),

    columnHelper.accessor(
      (row) => {
        const value = row.accruableGovernmentTaxInUsd;
        return isNaN(Number(value)) || value == null ? 0 : Number(value);
      },
      {
        id: t_att("accruableGovernmentTax"),
        header: ({ column }) => {
          return (
            <RntTableHeaderSorting
              className="min-w-[22ch]"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {t_att("accruableGovernmentTax")}
            </RntTableHeaderSorting>
          );
        },
        cell: (info) => {
          const value = Number(displayMoneyWith2DigitsOrNa(info.getValue()));
          return <span>{isNaN(value) ? "0.00" : value.toFixed(2)}</span>;
        },
        footer: ({ table, column }) => {
          const total = table.getRowModel().rows.reduce((sum, row) => {
            const value = row.getValue<number>(column.id);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);

          return (
            <>
              {t("common.total")} {total.toFixed(2)}
            </>
          );
        },
      }
    ),
  ];
}
