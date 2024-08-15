import { PaymentStatus } from "@/hooks/admin/useAdminAllTrips";
import { TripStatus } from "@/model/blockchain/schemas";

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

export function getAdminTripStatusBgColorFromStatus(tripStatus: TripStatus) {
  switch (tripStatus) {
    case TripStatus.Closed:
      return "bg-[#9148C8]";
    case TripStatus.CompletedWithoutGuestComfirmation:
      return "bg-[#C65911]";
    case TripStatus.Closed:
    case TripStatus.ClosedByAdminAfterCompleteWithoutGuestComfirmation:
    case TripStatus.ClosedByGuestAfterCompleteWithoutGuestComfirmation:
      return "bg-[#0070C0]";
    case TripStatus.Rejected:
    case TripStatus.HostRejected:
    case TripStatus.GuestRejected:
    case TripStatus.HostCanceled:
    case TripStatus.GuestCanceled:
      return "bg-[#FF0000]";
    default:
      return "";
  }
}

export function getAdminTextColorForPaymentStatus(paymentStatus: PaymentStatus) {
  switch (paymentStatus) {
    case "Unpaid":
      return "text-[#FF0000]";
    case "Refund to guest":
      return "text-[#FFFF00]";
    case "Paid to host":
      return "text-[#00B050]";
    case "Prepayment":
    default:
      return "text-[#9148C8]";
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
