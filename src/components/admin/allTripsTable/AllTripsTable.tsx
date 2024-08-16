import Link from "next/link";
import { dateFormatShortMonthDateTime } from "@/utils/datetimeFormatters";
import RntButton from "@/components/common/rntButton";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { TFunction } from "@/utils/i18n";
import { displayMoneyWith2DigitsOrNa } from "@/utils/numericFormatters";
import { TripStatus } from "@/model/blockchain/schemas";
import { usePathname } from "next/navigation";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { useState } from "react";

type AdminTripDetails = {
  tripId: number;
  carDescription: string;
  plateNumber: string;
  tripStatus: TripStatus;
  paymentsStatus: "Prepayment" | "Paid to host" | "Refund to guest" | "Unpaid";
  hostLocation: string;
  tripStartDate: Date;
  tripEndDate: Date;
  timeZoneId: string;
  tripDays: number;
  hostName: string;
  guestName: string;
  tripPriceBeforeDiscountInUsd: number;
  tripDiscountInUsd: number;
  tripPriceAfterDiscountInUsd: number;
  deliveryFeePickUpInUsd: number;
  deliveryFeeDropOffInUsd: number;
  salesTaxInUsd: number;
  governmentTaxInUsd: number;
  totalChargeForTripInUsd: number;
  refundForTripInUsd: number | undefined;
  depositReceivedInUsd: number;
  depositReturnedInUsd: number | undefined;
  reimbursementInUsd: number | undefined;
  hostEarningsInUsd: number | undefined;
  platformCommissionInUsd: number | undefined;
  accruableSalesTaxInUsd: number | undefined;
  accruableGovernmentTaxInUsd: number | undefined;
};

type AllTripsTableProps = {
  isHost: boolean;
  t: TFunction;
};

const TEST_DATA: AdminTripDetails[] = [
  {
    tripId: 10,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Closed,
    paymentsStatus: "Paid to host",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 450,
    reimbursementInUsd: 50,
    hostEarningsInUsd: 874,
    platformCommissionInUsd: 206,
    accruableSalesTaxInUsd: 72.1,
    accruableGovernmentTaxInUsd: 20,
  },
  {
    tripId: 11,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.CompletedWithoutGuestComfirmation,
    paymentsStatus: "Unpaid",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: undefined,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 12,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Closed, //finished by host, guest approve
    paymentsStatus: "Paid to host",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 450,
    reimbursementInUsd: 50,
    hostEarningsInUsd: 874,
    platformCommissionInUsd: 206,
    accruableSalesTaxInUsd: 72.1,
    accruableGovernmentTaxInUsd: 20,
  },
  {
    tripId: 13,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Closed, //finished by host, admin pay to host
    paymentsStatus: "Paid to host",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 450,
    reimbursementInUsd: 50,
    hostEarningsInUsd: 874,
    platformCommissionInUsd: 206,
    accruableSalesTaxInUsd: 72.1,
    accruableGovernmentTaxInUsd: 20,
  },
  {
    tripId: 14,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Closed, //finished by host, admin refund to guest
    paymentsStatus: "Refund to guest",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: 1122.1,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 500,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 15,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Rejected, //guest before confirm
    paymentsStatus: "Refund to guest",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: 1122.1,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 500,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 16,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Rejected, //guest after confirm
    paymentsStatus: "Refund to guest",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: 1122.1,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 500,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 17,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Rejected, //host before confirm
    paymentsStatus: "Refund to guest",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: 1122.1,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 500,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 18,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Rejected, //host after confirm
    paymentsStatus: "Refund to guest",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: 1122.1,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: 500,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 19,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Pending,
    paymentsStatus: "Prepayment",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: undefined,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 20,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Confirmed,
    paymentsStatus: "Prepayment",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: undefined,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 21,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.CheckedInByHost,
    paymentsStatus: "Prepayment",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: undefined,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 22,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Started,
    paymentsStatus: "Prepayment",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: undefined,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 23,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.CheckedOutByGuest,
    paymentsStatus: "Prepayment",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: undefined,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
  {
    tripId: 24,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Finished,
    paymentsStatus: "Prepayment",
    hostLocation: "Miami, Florida, US",
    tripStartDate: new Date(2023, 11, 15, 12, 47),
    tripEndDate: new Date(2023, 11, 16, 12, 48),
    timeZoneId: UTC_TIME_ZONE_ID,
    tripDays: 10,
    hostName: "James Webb",
    guestName: "Kirrill Parygin",
    tripPriceBeforeDiscountInUsd: 1000,
    tripDiscountInUsd: 100,
    tripPriceAfterDiscountInUsd: 900,
    deliveryFeePickUpInUsd: 60,
    deliveryFeeDropOffInUsd: 70,
    salesTaxInUsd: 72.1,
    governmentTaxInUsd: 20,
    totalChargeForTripInUsd: 1122.1,
    refundForTripInUsd: undefined,
    depositReceivedInUsd: 500,
    depositReturnedInUsd: undefined,
    reimbursementInUsd: undefined,
    hostEarningsInUsd: undefined,
    platformCommissionInUsd: undefined,
    accruableSalesTaxInUsd: undefined,
    accruableGovernmentTaxInUsd: undefined,
  },
];

export default function AllTripsTable({ isHost, t }: AllTripsTableProps) {
  const pathname = usePathname();

  const t_att: TFunction = (name, options) => {
    return t("all_trips_table." + name, options);
  };

  const [allTrips, setAllTrips] = useState<AdminTripDetails[]>(TEST_DATA);
  const headerSpanClassName = "text-center font-semibold px-2 font-light text-sm";
  const rowSpanClassName = "px-2 h-12 text-center";

  return (
    <div className="mt-5 min-h-[300px] rounded-2xl bg-rentality-bg p-4 pb-16">
      <div className="text-xl lg:hidden">The resolution is too low!</div>
      <table className="hidden w-full table-auto border-spacing-2 overflow-x-auto lg:block">
        <thead className="mb-2">
          <tr className="border-b-[2px] border-b-gray-500">
            <th className={`${headerSpanClassName} min-w-[5ch]`}>{t_att("tripId")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("vehicle")}</th>
            <th className={`${headerSpanClassName} min-w-[10ch]`}>{t_att("plateNumber")}</th>
            <th className={`${headerSpanClassName} min-w-[20ch]`}>{t_att("tripStatus")}</th>
            <th className={`${headerSpanClassName}`}>{t_att("paymentManagement")}</th>
            <th className={`${headerSpanClassName} min-w-[15ch]`}>{t_att("paymentsStatus")}</th>
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
          {allTrips.map((tripItem) => {
            const detailsLink = `/${isHost ? "host" : "guest"}/trips/tripInfo/${tripItem.tripId}?back=${pathname}`;

            return (
              <tr key={tripItem.tripId} className="border-b-[2px] border-b-gray-500">
                <td className={rowSpanClassName}>{tripItem.tripId}</td>
                <td className={rowSpanClassName}>{tripItem.carDescription}</td>
                <td className={rowSpanClassName}>{tripItem.plateNumber}</td>
                <td className={rowSpanClassName}>{getTripStatusTextFromStatus(tripItem.tripStatus)}</td>
                <td className={rowSpanClassName}>
                  {tripItem.paymentsStatus === "Unpaid" ? (
                    <div className="flex flex-col gap-2 py-2">
                      <RntButton className="h-8 w-40">Pay to Host</RntButton>
                      <RntButton className="h-8 w-40">Refund to Guest</RntButton>
                    </div>
                  ) : null}
                </td>
                <td className={rowSpanClassName}>{tripItem.paymentsStatus}</td>
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
    </div>
  );
}
