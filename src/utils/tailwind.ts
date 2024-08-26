import { AdminTripStatus, PaymentStatus, TripStatus } from "@/model/blockchain/schemas";

export function getTripStatusBgColorFromStatus(status: TripStatus) {
  switch (status) {
    case TripStatus.Pending:
      return "bg-yellow-600";
    case TripStatus.Confirmed:
      return "bg-lime-500";
    case TripStatus.CheckedInByHost:
      return "bg-blue-600";
    case TripStatus.Started:
      return "bg-blue-800";
    case TripStatus.CheckedOutByGuest:
      return "bg-purple-600";
    case TripStatus.CompletedWithoutGuestComfirmation:
      return "bg-orange-400";
    case TripStatus.Finished:
      return "bg-purple-800";
    case TripStatus.Closed:
      return "bg-fuchsia-700";
    case TripStatus.Rejected:
    default:
      return "bg-red-500";
  }
}

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

export function getDotStatusColor(color: `#${string}` | "success" | "error") {
  switch (color) {
    case "success":
      return "bg-[#2EB100]";
    case "error":
      return "bg-[#DB001A]";
    default:
      return `bg-[${color}]`;
  }
}
