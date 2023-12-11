"use client";

import ChatHeader from "@/components/chat/chatHeader";
import ChatList from "@/components/chat/chatList";
import ChatMessages from "@/components/chat/chatMessages";
import SendMessage from "@/components/chat/sendMessage";
import RntButton from "@/components/common/rntButton";
import { ChatInfo } from "@/model/ChatInfo";
import { useEffect, useRef } from "react";

export default function ChatPage({
  isHost,
  chats,
  selectedTridId,
  selectChat,
  sendMessage,
}: {
  isHost: boolean;
  chats: ChatInfo[];
  selectedTridId: number;
  selectChat: (tripId: number) => void;
  sendMessage: (toAddress: string, tripId: number, message: string) => Promise<void>;
}) {
  const pageTitle = document.getElementById("page-title") as HTMLDivElement;
  const selectedChatRef = useRef<HTMLDivElement>(pageTitle);
  const selectedChat = chats.find((ci) => ci.tripId === selectedTridId) ?? null;

  useEffect(() => {
    if (selectedChatRef.current) {
      selectedChatRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        />
      ) : (
        <div className="w-full xl:w-3/5 flex flex-col gap-2">
          <RntButton className="w-40 h-12" onClick={() => selectChat(-1)}>
            Back
          </RntButton>

          <div className="font-bold text-2xl">{selectedChat.hostName}</div>
          <ChatHeader selectedChat={selectedChat} />
          <ChatMessages selectedChat={selectedChat} isHost={isHost} />
          <SendMessage
            sendMessageCallback={async (message: string) => {
              await sendMessage(
                isHost ? selectedChat.guestAddress : selectedChat.hostAddress,
                selectedChat.tripId,
                message
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
