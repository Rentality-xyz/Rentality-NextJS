"use client";

import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatList from "@/features/chat/components/ChatList";
import ChatMessages from "@/features/chat/components/ChatMessages";
import SendMessage from "@/features/chat/components/SendMessage";
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
  const selectedChatRef = useRef<ElementRef<"div">>();
  const selectedChat = chats.find((ci) => ci.tripId === selectedTridId) ?? null;

  useEffect(() => {
    const pageTitle = document.getElementById("page-title") as HTMLDivElement;
    selectedChatRef.current = pageTitle;
  }, []);

  useEffect(() => {
    selectedChatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selectedTridId]);

  return (
    <div className="mt-5 flex flex-row gap-4">
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
        <div className="flex w-full flex-col gap-2">
          <RntButton className="h-12 w-40" onClick={() => selectChat(-1)}>
            {t("back")}
          </RntButton>

          <div className="pl-4 text-2xl font-bold">{selectedChat.hostName}</div>
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
