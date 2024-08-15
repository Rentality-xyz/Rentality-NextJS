import { TripStatus } from "@/model/blockchain/schemas";
import { formatLocationInfoUpToCity, LocationInfo } from "@/model/LocationInfo";
import { Ok, Result } from "@/model/utils/result";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { bigIntReplacer } from "@/utils/json";
import { useEffect, useState } from "react";

export const PaymentStatuses = ["Prepayment", "Paid to host", "Refund to guest", "Unpaid"] as const;
export type PaymentStatus = (typeof PaymentStatuses)[number];

export type AdminTripDetails = {
  tripId: number;
  carDescription: string;
  plateNumber: string;
  tripStatus: TripStatus;
  paymentsStatus: PaymentStatus;
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

export type AdminAllTripsFilters = {
  status?: TripStatus;
  paymentStatus?: PaymentStatus;
  location?: LocationInfo;
  startDateTimeUtc?: Date;
  endDateTimeUtc?: Date;
};

function getPaymentStatusByTripStatus(status: TripStatus): PaymentStatus {
  switch (status) {
    case TripStatus.Pending:
    case TripStatus.Confirmed:
    case TripStatus.CheckedInByHost:
    case TripStatus.Started:
    case TripStatus.CheckedOutByGuest:
    case TripStatus.Finished:
      return "Prepayment";

    case TripStatus.Closed:
    case TripStatus.ClosedByGuestAfterCompleteWithoutGuestComfirmation:
    case TripStatus.ClosedByAdminAfterCompleteWithoutGuestComfirmation:
      return "Paid to host";

    case TripStatus.Rejected:
    case TripStatus.HostRejected:
    case TripStatus.HostCanceled:
    case TripStatus.GuestRejected:
    case TripStatus.GuestCanceled:
      return "Refund to guest";

    case TripStatus.CompletedWithoutGuestComfirmation:
    default:
      return "Unpaid";
  }
}

const TEST_DATA: AdminTripDetails[] = [
  {
    tripId: 10,
    carDescription: "BMW 330i 2023",
    plateNumber: "XYZ9876",
    tripStatus: TripStatus.Closed,
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.Closed),
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
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.CompletedWithoutGuestComfirmation),
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
    tripStatus: TripStatus.ClosedByGuestAfterCompleteWithoutGuestComfirmation, //finished by host, guest approve
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.ClosedByGuestAfterCompleteWithoutGuestComfirmation),
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
    tripStatus: TripStatus.ClosedByAdminAfterCompleteWithoutGuestComfirmation, //finished by host, admin pay to host
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.ClosedByAdminAfterCompleteWithoutGuestComfirmation),
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
    tripStatus: TripStatus.ClosedByAdminAfterCompleteWithoutGuestComfirmation, //finished by host, admin refund to guest
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.ClosedByAdminAfterCompleteWithoutGuestComfirmation),
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
    tripStatus: TripStatus.GuestRejected, //guest before confirm
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.GuestRejected),
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
    tripStatus: TripStatus.GuestCanceled, //guest after confirm
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.GuestCanceled),
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
    tripStatus: TripStatus.HostRejected, //host before confirm
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.HostRejected),
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
    tripStatus: TripStatus.HostCanceled, //host after confirm
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.HostCanceled),
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
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.Pending),
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
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.Confirmed),
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
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.CheckedInByHost),
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
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.Started),
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
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.CheckedOutByGuest),
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
    paymentsStatus: getPaymentStatusByTripStatus(TripStatus.Finished),
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

const useAdminAllTrips = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminTripDetails[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  async function fetchData(filters?: AdminAllTripsFilters, page: number = 1, itemsPerPage: number = 10) {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    console.log(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

    const filteredData = TEST_DATA.filter(
      (i) =>
        !filters ||
        ((filters.status === undefined || i.tripStatus === filters.status) &&
          (!filters.paymentStatus || i.paymentsStatus === filters.paymentStatus) &&
          (!filters.location || i.hostLocation === formatLocationInfoUpToCity(filters.location)) &&
          (!filters.startDateTimeUtc || i.tripStartDate >= filters.startDateTimeUtc) &&
          (!filters.endDateTimeUtc || i.tripEndDate <= filters.endDateTimeUtc))
    );
    setData(filteredData);
    setTotalCount(filteredData.length);
    setIsLoading(false);
  }

  async function payToHost(tripId: number): Promise<Result<boolean, string>> {
    await new Promise((res) => setTimeout(res, 1000));
    return Ok(true);
  }

  async function refundToGuest(tripId: number): Promise<Result<boolean, string>> {
    await new Promise((res) => setTimeout(res, 1000));
    return Ok(true);
  }

  useEffect(() => {
    const init = async () => {
      await new Promise((res) => setTimeout(res, 1000));
      setData(TEST_DATA);
      setTotalCount(TEST_DATA.length);
      setIsLoading(false);
    };

    init();
  }, []);

  return { isLoading, data: { data: data, totalCount: totalCount }, fetchData, payToHost, refundToGuest } as const;
};

export default useAdminAllTrips;
