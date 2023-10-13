import RntButton from "@/components/common/rntButton";
import RntDialogs from "@/components/common/rntDialogs";
import GuestLayout from "@/components/guest/layout/guestLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useChatInfos from "@/hooks/chat/useChatInfos";
import useRntDialogs from "@/hooks/useRntDialogs";
import { TripStatus } from "@/model/TripInfo";
import { dateFormat } from "@/utils/datetimeFormatters";
import { Avatar } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export type ChatInfo = {
  tripId: number;

  guestAddress: string;
  guestName: string;
  guestPhotoUrl: string;

  hostAddress: string;
  hostName: string;
  hostPhotoUrl: string;

  tripTitle: string;
  lastMessage: string;

  carPhotoUrl: string;
  tripStatus: TripStatus;
  carTitle: string;
  carLicenceNumber: string;

  messages: ChatMesssage[];
};

export type ChatMesssage = {
  fromAddress: string;
  toAddress: string;
  datestamp: Date;
  message: string;
};

export default function Messages() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();
  const [dataFetched, chats, sendMessage] = useChatInfos(false);
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");

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

  const selectChat = (tripId: number) => {
    const item = chats.find((ci) => ci.tripId === tripId) ?? null;
    setSelectedChat(item);
    if (item !== null) {
      //createChatMessages(item);
    }
  };

  useEffect(() => {
    if (selectedChat !== null) {
      const item =
        chats.find((ci) => ci.tripId === selectedChat.tripId) ?? null;
      setSelectedChat(item);
    }
  }, [chats]);

  return (
    <GuestLayout>
      <div className="flex flex-col">
        <PageTitle title="Chats" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <div className="flex flex-row gap-4 mt-5">
            <div className="w-2/5 flex flex-col gap-2">
              {chats.map((chatInfo) => {
                return (
                  <div
                    key={chatInfo.tripId}
                    className={`rnt-card w-full grid grid-cols-[auto_1fr_auto] gap-x-2 rounded-xl overflow-hidden p-2 ${
                      chatInfo.tripId === selectedChat?.tripId
                        ? "rnt-card-selected"
                        : ""
                    }`}
                    onClick={() => {
                      selectChat(chatInfo.tripId);
                    }}
                  >
                    <div className="w-24 h-24 row-span-3 self-center">
                      <Avatar
                        src={chatInfo.hostPhotoUrl}
                        sx={{ width: "6rem", height: "6rem" }}
                      ></Avatar>
                    </div>
                    <div className="col-span-2 self-end font-bold text-lg">
                      {chatInfo.hostName}
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
              })}
            </div>
            {selectedChat !== null ? (
              <div className="w-3/5 flex flex-col gap-2">
                <div className="font-bold text-2xl">
                  {selectedChat.hostName}
                </div>
                <section className="rnt-card mt-4 rounded-xl flex flex-row overflow-hidden">
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

                <div className="my-4 flex flex-col gap-4">
                  {selectedChat.messages.map((msgInfo, index) => {
                    return msgInfo.fromAddress.toLowerCase() ===
                      selectedChat.hostAddress.toLowerCase() ? (
                      <div
                        key={index}
                        className="rnt-card-selected w-5/6 grid grid-cols-[auto_1fr_auto] gap-2 rounded-xl rounded-ss-none  overflow-hidden p-4"
                      >
                        <div className="w-12 h-12">
                          <Avatar
                            src={selectedChat.hostPhotoUrl}
                            sx={{ width: "3rem", height: "3rem" }}
                          ></Avatar>
                        </div>
                        <div className="font-bold text-lg self-center">
                          {selectedChat.hostName}
                        </div>
                        <div className="text-sm self-center text-gray-600">
                          {dateFormat(msgInfo.datestamp)}
                        </div>
                        <div className="col-span-3 text-sm">
                          {msgInfo.message}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="rnt-card w-5/6 grid grid-cols-[auto_1fr_auto] gap-2 rounded-xl rounded-se-none overflow-hidden p-4 self-end"
                      >
                        <div className="text-sm self-center text-gray-600">
                          {dateFormat(msgInfo.datestamp)}
                        </div>
                        <div className="font-bold text-lg self-center text-end">
                          {selectedChat.guestName}
                        </div>
                        <div className="w-12 h-12">
                          <Avatar
                            src={selectedChat.guestPhotoUrl}
                            sx={{ width: "3rem", height: "3rem" }}
                          ></Avatar>
                        </div>
                        <div className="col-span-3 text-sm">
                          {msgInfo.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <section className="mb-12">
                  <div className="text-2xl">Send a message</div>
                  <textarea
                    className="text-black w-full px-4 py-2 border-2 rounded-2xl my-2 text-lg"
                    rows={5}
                    id="message"
                    placeholder="Enter your message"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                    }}
                  />
                  <RntButton
                    onClick={async () => {
                      await sendMessage(selectedChat.tripId, newMessage);
                      setNewMessage("");
                    }}
                  >
                    Send a message
                  </RntButton>
                </section>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </GuestLayout>
  );
}
