"use client";

import { MouseEventHandler } from "react";
import { ChatInfo } from "@/model/ChatInfo";
import { getTripStatusTextFromStatus } from "@/model/TripInfo";
import { Avatar } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { TFunction } from "@/utils/i18n";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { getTripStatusBgColorFromStatus } from "@/utils/tailwind";

export default function ChatInfoCard({
  chatInfo,
  isHost,
  isSelected,
  onClickCallback,
  t,
}: {
  chatInfo: ChatInfo;
  isHost: boolean;
  isSelected: boolean;
  onClickCallback: MouseEventHandler<HTMLDivElement> | undefined;
  t: TFunction;
}) {
  const className = `${chatInfo.isSeen ? "bg-rentality-bg" : "bg-rentality-additional-tint"} rnt-card w-full grid grid-cols-[auto_1fr_auto] gap-x-2 rounded-xl overflow-hidden p-2 ${
    isSelected ? "rnt-card-selected" : ""
  }`;
  const otherPhotoUrl = isHost ? chatInfo.guestPhotoUrl : chatInfo.hostPhotoUrl;
  const otherName = isHost ? chatInfo.guestName : chatInfo.hostName;

  let statusBgColor = getTripStatusBgColorFromStatus(chatInfo.tripStatus);
  const statusClassName = cn("px-2 text-rnt-temp-status-text", statusBgColor);

  const pathname = usePathname();
  const unreadMessageCount = chatInfo.messages.filter(
    (m) => chatInfo.seenAt === null || m.datestamp > chatInfo.seenAt
  ).length;

  return (
    <div key={chatInfo.tripId} className={className}>
      <div className="row-span-3 mx-2 h-24 w-24 cursor-pointer self-center" onClick={onClickCallback}>
        <Avatar src={otherPhotoUrl} sx={{ width: "6rem", height: "6rem" }}></Avatar>
      </div>
      <div
        className="col-span-2 flex cursor-pointer flex-row items-center max-sm:justify-between"
        onClick={onClickCallback}
      >
        <div className={statusClassName}>{getTripStatusTextFromStatus(chatInfo.tripStatus)}</div>
        <div className="ml-2 text-xs"> {t("reservation", { trip: chatInfo.tripId })}</div>
      </div>
      <div className="flex cursor-pointer flex-col truncate text-sm" onClick={onClickCallback}>
        <strong>{otherName}</strong>
        <div>{chatInfo.carTitle}</div>
      </div>
      <Link href={`/${isHost ? "host" : "guest"}/trips/tripInfo/${chatInfo.tripId}?back=${pathname}`}>
        <Image className="sm:hidden" src={"/images/icons/ic-info-teal.svg"} width={25} height={25} alt="" />
        <span className="text-sm text-rentality-secondary max-sm:hidden">{t("trip_info")}</span>
      </Link>
      <div
        className={cn(
          "col-span-2 flex cursor-pointer flex-row justify-between truncate",
          !chatInfo.isSeen ? "font-semibold" : ""
        )}
        onClick={onClickCallback}
      >
        <span>{chatInfo.lastMessage}</span>
        {!chatInfo.isSeen && unreadMessageCount > 0 && (
          <span className="min-w-[1.75rem] rounded-full bg-rentality-secondary pt-0.5 text-center">
            {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
          </span>
        )}
      </div>
    </div>
  );
}
