import { ChatInfo } from "@/model/ChatInfo";
import { TripStatus, getTripStatusBgColorClassFromStatus, getTripStatusTextFromStatus } from "@/model/TripInfo";
import { Avatar } from "@mui/material";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

type Props = {
  chatInfo: ChatInfo;
  isHost: boolean;
  isSelected: boolean;
  onClickCallback: () => void;
};

export default function ChatInfoCard({ chatInfo, isHost, isSelected, onClickCallback }: Props) {
  const className = `bg-rentality-bg rnt-card w-full grid grid-cols-[auto_1fr_auto] gap-x-2 rounded-xl overflow-hidden p-2 ${
    isSelected ? "rnt-card-selected" : ""
  }`;
  const otherPhotoUrl = isHost ? chatInfo.guestPhotoUrl : chatInfo.hostPhotoUrl;
  const otherName = isHost ? chatInfo.guestName : chatInfo.hostName;

  let statusBgColor = getTripStatusBgColorClassFromStatus(chatInfo.tripStatus);
  const statusClassName = twMerge("px-2 text-rnt-temp-status-text", statusBgColor);

  return (
    <div key={chatInfo.tripId} className={className} onClick={onClickCallback}>
      <div className="w-24 h-24 row-span-3 self-center mx-2">
        <Avatar src={otherPhotoUrl} sx={{ width: "6rem", height: "6rem" }}></Avatar>
      </div>
      <div className="col-span-2 flex flex-row items-center">
        <div className={statusClassName}>{getTripStatusTextFromStatus(chatInfo.tripStatus)}</div>
        <div className="ml-2 text-xs"> Reservation #{chatInfo.tripId}</div>
      </div>
      <div className="flex flex-col text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
        <strong>{otherName}</strong>
        <div>{chatInfo.carTitle}</div>
      </div>
      <Link className="text-sm text-rentality-secondary" href={`/guest/trips/tripInfo/${chatInfo.tripId}`}>
        Trip information
      </Link>
      <div className="col-span-2 whitespace-nowrap overflow-hidden overflow-ellipsis ">{chatInfo.lastMessage}</div>
    </div>
  );
}
