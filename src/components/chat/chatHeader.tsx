import { ChatInfo } from "@/model/ChatInfo";
import { TripStatus } from "@/model/TripInfo";
import { twMerge } from "tailwind-merge";

export default function ChatHeader({ selectedChat }: {selectedChat:ChatInfo}) {
  
  let statusBgColor = "";
  switch (selectedChat?.tripStatus) {
    case TripStatus.Pending:
      statusBgColor = "bg-yellow-600";
      break;
    case TripStatus.Confirmed:
      statusBgColor = "bg-lime-500";
      break;
    case TripStatus.CheckedInByHost:
      statusBgColor = "bg-blue-600";
      break;
    case TripStatus.Started:
      statusBgColor = "bg-blue-800";
      break;
    case TripStatus.CheckedOutByGuest:
      statusBgColor = "bg-purple-600";
      break;
    case TripStatus.Finished:
      statusBgColor = "bg-purple-800";
      break;
    case TripStatus.Closed:
      statusBgColor = "bg-fuchsia-700";
      break;
    case TripStatus.Rejected:
      statusBgColor = "bg-red-500";
      break;
  }
  const statusClassName = twMerge(
    "absolute right-0 top-2 px-4 py-1 rounded-l-3xl bg-purple-600 text-rnt-temp-status-text text-end text-sm",
    statusBgColor
  );

  return (
    <section className="rnt-card mt-4 rounded-xl flex overflow-hidden">
      <div
        style={{
          backgroundImage: `url(${selectedChat.carPhotoUrl})`,
        }}
        className="relative w-1/4 min-h-[6rem] flex-shrink-0 bg-center bg-cover"
      >
        <div className={statusClassName}>
          <strong className="text-sm">
            {selectedChat.tripStatus}
          </strong>
        </div>
      </div>
      <div className="w-3/4 flex flex-col gap-2 justify-center  p-2 pl-8">
        <div className="text-xl whitespace-nowrap overflow-hidden overflow-ellipsis">
          {selectedChat.carTitle}
        </div>
        <div className="text-sm">
          {selectedChat.carLicenceNumber}
        </div>
      </div>
    </section>
  );
}
