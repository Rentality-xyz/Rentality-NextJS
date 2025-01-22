import { AdminTripStatus, PaymentStatus } from "@/model/blockchain/schemas";

export function getAdminTripStatusBgColorFromStatus(adminStatus: AdminTripStatus) {
  switch (adminStatus) {
    case AdminTripStatus.Finished:
      return "bg-[#9148C8]";
    case AdminTripStatus.CompletedWithoutGuestConfirmation:
      return "bg-[#C65911]";
    case AdminTripStatus.CompletedByGuest:
    case AdminTripStatus.CompletedByAdmin:
      return "bg-[#0070C0]";
    case AdminTripStatus.GuestCanceledBeforeApprove:
    case AdminTripStatus.HostCanceledBeforeApprove:
    case AdminTripStatus.GuestCanceledAfterApprove:
    case AdminTripStatus.HostCanceledAfterApprove:
      return "bg-[#FF0000]";

    default:
      return "";
  }
}

export function getAdminTextColorForPaymentStatus(paymentStatus: PaymentStatus) {
  switch (paymentStatus) {
    case PaymentStatus.Unpaid:
      return "text-[#FF0000]";
    case PaymentStatus.RefundToGuest:
      return "text-[#FFFF00]";
    case PaymentStatus.PaidToHost:
      return "text-[#00B050]";
    case PaymentStatus.Prepayment:
      return "text-[#9148C8]";
    default:
      return "";
  }
}
