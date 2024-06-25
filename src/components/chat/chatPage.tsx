"use client";

import ChatHeader from "@/components/chat/chatHeader";
import ChatList from "@/components/chat/chatList";
import ChatMessages from "@/components/chat/chatMessages";
import SendMessage from "@/components/chat/sendMessage";
import RntButton from "@/components/common/rntButton";
import { ChatInfo } from "@/model/ChatInfo";
import { ElementRef, useEffect, useRef } from "react";
import { TFunction } from "@/utils/i18n";

export default function ChatPage({
  isHost,
  chats,
  selectedTridId,
  selectChat,
  sendMessage,
  t,
}: {
  isHost: boolean;
  chats: ChatInfo[];
  selectedTridId: number;
  selectChat: (tripId: number) => void;
  sendMessage: (toAddress: string, tripId: number, message: string) => Promise<void>;
  t: TFunction;
}) {
  const pageTitle = document.getElementById("page-title") as HTMLDivElement;
  const selectedChatRef = useRef<ElementRef<"div">>(pageTitle);
  const selectedChat = chats.find((ci) => ci.tripId === selectedTridId) ?? null;

  useEffect(() => {
    selectedChatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selectedTridId]);

  return (
    <div className="flex flex-row gap-4 mt-5">
      {selectedChat === null ? (
        <ChatList
          chats={chats}
          isHost={isHost}
          selectedChat={selectedChat ?? undefined}
          selectChatCallback={(tripId) => {
            selectChat(tripId);
          }}
          t={t}
        />
      ) : (
        <div className="w-full xl:w-3/5 flex flex-col gap-2">
          <RntButton className="w-40 h-12" onClick={() => selectChat(-1)}>
            {t("back")}
          </RntButton>

          <div className="font-bold text-2xl">{selectedChat.hostName}</div>
          <ChatHeader selectedChat={selectedChat} t={t} />
          <ChatMessages selectedChat={selectedChat} isHost={isHost} />
          <SendMessage
            sendMessageCallback={async (message: string) => {
              await sendMessage(
                isHost ? selectedChat.guestAddress : selectedChat.hostAddress,
                selectedChat.tripId,
                message
              );
            }}
            t={t}
          />
        </div>
      )}
    </div>
  );
}
