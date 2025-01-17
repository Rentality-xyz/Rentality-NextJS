import { AdminTripStatus, PaymentStatus } from "@/model/blockchain/schemas";

export type AdminTripDetails = {
  tripId: number;
  carDescription: string;
  plateNumber: string;
  tripStatus: AdminTripStatus;
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
  promoCode?: string;
  promoCodeValueInPercents?: number;
  promoCodeEnterDate?: Date;
};

export const getTripStatusTextFromAdminStatus = (status: AdminTripStatus) => {
  switch (status) {
    case AdminTripStatus.Created:
      return "Pending";
    case AdminTripStatus.Approved:
      return "Confirmed";
    case AdminTripStatus.CheckedInByHost:
      return "Started";
    case AdminTripStatus.CheckedInByGuest:
      return "On the trip";
    case AdminTripStatus.CheckedOutByGuest:
      return "Finished by guest";
    case AdminTripStatus.CompletedWithoutGuestConfirmation:
      return "Completed without guest confirmation";
    case AdminTripStatus.CheckedOutByHost:
      return "Finished";
    case AdminTripStatus.Finished:
      return "Completed";
    case AdminTripStatus.CompletedByGuest:
      return "Completed by guest";
    case AdminTripStatus.CompletedByAdmin:
      return "Completed by administrator";
    case AdminTripStatus.GuestCanceledBeforeApprove:
      return "Guest Cancellation before Host confirmed";
    case AdminTripStatus.GuestCanceledAfterApprove:
      return "Guest Cancellation after host confirmed";
    case AdminTripStatus.HostCanceledBeforeApprove:
      return "Host Booked Cancellation";
    case AdminTripStatus.HostCanceledAfterApprove:
      return "Host trip Cancellation";
    default:
      return "Unknown";
  }
};

export const getPaymentStatusText = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PaidToHost:
      return "Paid to host";
    case PaymentStatus.Prepayment:
      return "Prepayment";
    case PaymentStatus.RefundToGuest:
      return "Refund to guest";
    case PaymentStatus.Unpaid:
      return "Unpaid";
    default:
      return "Unknown";
  }
};
