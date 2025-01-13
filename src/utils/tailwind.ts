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

export function getDotStatusColor(color: `#${string}` | "success" | "error" | "warning") {
  switch (color) {
    case "success":
      return "bg-[#2EB100]";
    case "error":
      return "bg-[#DB001A]";
    case "warning":
      return "bg-[#FFC000]";
    default:
      return `bg-[${color}]`;
  }
}
