import ChatHeader from "@/components/chat/chatHeader";
import ChatList from "@/components/chat/chatList";
import ChatMessages from "@/components/chat/chatMessages";
import SendMessage from "@/components/chat/sendMessage";
import RntButton from "@/components/common/rntButton";
import { ChatInfo } from "@/model/ChatInfo";
import { useEffect, useState } from "react";

export default function ChatPage({
  isHost,
  chats,
  sendMessage,
}: {
  isHost: boolean;
  chats: ChatInfo[];
  sendMessage: (
    toAddress: string,
    tripId: number,
    message: string
  ) => Promise<void>;
}) {
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);
  const [isOpenChat, setIsOpenChat] = useState(false);

  const selectChat = (tripId: number) => {
    const item = chats.find((ci) => ci.tripId === tripId) ?? null;
    setSelectedChat(item);
    setIsOpenChat(item !== null);
  };

  useEffect(() => {
    if (selectedChat !== null) {
      const item =
        chats.find((ci) => ci.tripId === selectedChat.tripId) ?? null;
      setSelectedChat(item);
    }
  }, [chats]);

  return (
    <div className="flex flex-row gap-4 mt-5">
      {!isOpenChat && (
        <ChatList
          chats={chats}
          isHost={isHost}
          selectedChat={selectedChat ?? undefined}
          selectChatCallback={(tripId) => {
            selectChat(tripId);
          }}
        />
      )}

      {selectedChat !== null && isOpenChat ? (
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
                selectedChat.hostAddress,
                selectedChat.tripId,
                message
              );
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
