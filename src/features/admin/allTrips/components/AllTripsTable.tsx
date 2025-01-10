import Link from "next/link";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import RntButton from "@/components/common/rntButton";
import Loading from "@/components/common/Loading";
import RntSuspense from "@/components/common/rntSuspense";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2DigitsOrNa } from "@/utils/numericFormatters";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useRntSnackbars } from "@/contexts/rntDialogsContext";
import {
  getAdminTripStatusBgColorFromStatus,
  getAdminTextColorForPaymentStatus,
} from "@/features/admin/allTrips/utils/tailwind";
import { Result } from "@/model/utils/result";
import { PaymentStatus } from "@/model/blockchain/schemas";
import {
  AdminTripDetails,
  getPaymentStatusText,
  getTripStatusTextFromAdminStatus,
} from "@/features/admin/allTrips/models/AdminTripDetails";

type AllTripsTableProps = {
  isLoading: boolean;
  data: AdminTripDetails[];
  payToHost: (tripId: number) => Promise<Result<boolean, string>>;
  refundToGuest: (tripId: number) => Promise<Result<boolean, string>>;
};

export default function AllTripsTable({ isLoading, data, payToHost, refundToGuest }: AllTripsTableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { showError } = useRntSnackbars();

  const t_att: TFunction = (name, options) => {
    return t("all_trips_table." + name, options);
  };

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

  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  return (
    <RntSuspense
      isLoading={isLoading}
      fallback={
        <div className="rounded-b-2xl bg-rentality-bg p-4 pb-8">
          <Loading />
        </div>
      }
    >
      <div className="text-xl lg:hidden">{t("common.low_resolution")}</div>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={`${headerSpanClassName} min-w-[5ch]`}>{t_att("tripId")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("vehicle")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("plateNumber")}</th>
            <th className={`${headerSpanClassName} min-w-[25ch]`}>{t_att("tripStatus")}</th>
            <th className={`${headerSpanClassName}`}>{t_att("paymentManagement")}</th>
            <th className={`${headerSpanClassName} min-w-[17ch]`}>{t_att("paymentsStatus")}</th>
            <th className={`${headerSpanClassName} min-w-[18ch]`}>{t_att("location")}</th>
            <th className={`${headerSpanClassName} min-w-[18ch]`}>{t_att("start")}</th>
            <th className={`${headerSpanClassName} min-w-[18ch]`}>{t_att("end")}</th>
            <th className={`${headerSpanClassName}`}>{t_att("days")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("host")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("guest")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("tripPriceBeforeDiscount")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("discountAmount")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("tripPriceAfterDiscount")}</th>
            <th className={`${headerSpanClassName} min-w-[16ch]`}>{t_att("deliveryFeePickUp")}</th>
            <th className={`${headerSpanClassName} min-w-[16ch]`}>{t_att("deliveryFeeDropOff")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("salesTax")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("governmentTax")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("totalChargeForTrip")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("refundForTrip")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("depositReceived")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("depositReturned")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("reimbursement")}</th>
            <th className={`${headerSpanClassName} min-w-[12ch]`}>{t_att("hostEarnings")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("platformCommission")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("details")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("accruableSalesTax")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("accruableGovernmentTax")}</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((tripItem) => {
            const detailsLink = `/admin/trips/tripInfo/${tripItem.tripId}?back=${pathname}`;
            const tripStatusBgColor = getAdminTripStatusBgColorFromStatus(tripItem.tripStatus);
            const paymentStatusTextColor = getAdminTextColorForPaymentStatus(tripItem.paymentsStatus);

            return (
              <tr key={tripItem.tripId} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{tripItem.tripId}</td>
                <td className={rowSpanClassName}>{tripItem.carDescription}</td>
                <td className={rowSpanClassName}>{tripItem.plateNumber}</td>
                <td className={cn(rowSpanClassName, tripStatusBgColor, "font-semibold")}>
                  {getTripStatusTextFromAdminStatus(tripItem.tripStatus)}
                </td>
                <td className={rowSpanClassName}>
                  {tripItem.paymentsStatus === PaymentStatus.Unpaid && (
                    <div className="flex flex-col gap-2 py-2">
                      <RntButton
                        className="h-8 w-40 bg-[#548235]"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handlePayToHost(tripItem.tripId)}
                      >
                        {t_att("pay_to_host")}
                      </RntButton>
                      <RntButton
                        className="h-8 w-40 bg-[#C55A11]"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleRefundToGuest(tripItem.tripId)}
                      >
                        {t_att("refund_to_guest")}
                      </RntButton>
                    </div>
                  )}
                </td>
                <td className={cn(rowSpanClassName, paymentStatusTextColor, "font-semibold")}>
                  {getPaymentStatusText(tripItem.paymentsStatus)}
                </td>
                <td className={rowSpanClassName}>{tripItem.hostLocation}</td>
                <td className={rowSpanClassName}>
                  {dateFormatShortMonthDateTime(tripItem.tripStartDate, tripItem.timeZoneId)}
                </td>
                <td className={rowSpanClassName}>
                  {dateFormatShortMonthDateTime(tripItem.tripEndDate, tripItem.timeZoneId)}
                </td>
                <td className={rowSpanClassName}>{tripItem.tripDays}</td>
                <td className={rowSpanClassName}>{tripItem.hostName}</td>
                <td className={rowSpanClassName}>{tripItem.guestName}</td>
                <td className={rowSpanClassName}>
                  ${displayMoneyWith2DigitsOrNa(tripItem.tripPriceBeforeDiscountInUsd)}
                </td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.tripDiscountInUsd)}</td>
                <td className={rowSpanClassName}>
                  {displayMoneyWith2DigitsOrNa(tripItem.tripPriceAfterDiscountInUsd)}
                </td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.deliveryFeePickUpInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.deliveryFeeDropOffInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.salesTaxInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.governmentTaxInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.totalChargeForTripInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.refundForTripInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.depositReceivedInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.depositReturnedInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.reimbursementInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.hostEarningsInUsd)}</td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.platformCommissionInUsd)}</td>
                <td className={rowSpanClassName}>
                  <Link href={detailsLink}>
                    <span className="text-rentality-secondary">{t_att("details")}</span>
                  </Link>
                </td>
                <td className={rowSpanClassName}>{displayMoneyWith2DigitsOrNa(tripItem.accruableSalesTaxInUsd)}</td>
                <td className={rowSpanClassName}>
                  {displayMoneyWith2DigitsOrNa(tripItem.accruableGovernmentTaxInUsd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </RntSuspense>
  );
}
