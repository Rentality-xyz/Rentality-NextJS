import { ChatInfo } from "@/model/ChatInfo";
import { Avatar } from "@mui/material";
import Link from "next/link";

type Props = {
  chatInfo: ChatInfo;
  isHost:boolean;
  isSelected: boolean;
  onClickCallback: () => void;
};

export default function ChatInfoCard({
  chatInfo,
  isHost,
  isSelected,
  onClickCallback,
}: Props) {
  const className = `bg-rentality-bg rnt-card w-full grid grid-cols-[auto_1fr_auto] gap-x-2 rounded-xl overflow-hidden p-2 ${
    isSelected ? "rnt-card-selected" : ""
  }`;
  const otherPhotoUrl = isHost ? chatInfo.guestAddress : chatInfo.hostPhotoUrl;
  const otherName = isHost ? chatInfo.guestName : chatInfo.hostName;

  return (
    <div key={chatInfo.tripId} className={className} onClick={onClickCallback}>
      <div className="w-24 h-24 row-span-3 self-center">
        <Avatar
          src={otherPhotoUrl}
          sx={{ width: "6rem", height: "6rem" }}
        ></Avatar>
      </div>
      <div className="col-span-2 self-end font-bold text-lg">
        {otherName}
      </div>
      <div className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
        {chatInfo.tripTitle}
      </div>
      <Link
        className="text-sm"
        href={`/guest/trips/tripInfo/${chatInfo.tripId}`}
      >
        Trip information
      </Link>
      <div className="col-span-2 whitespace-nowrap overflow-hidden overflow-ellipsis ">
        {chatInfo.lastMessage}
      </div>
    </div>
  );
}
