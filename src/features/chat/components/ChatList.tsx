import { ChatInfo } from "@/model/ChatInfo";
import ChatInfoCard from "./ChatInfoCard";
import { TFunction } from "@/utils/i18n";

export default function ChatList({
  chats,
  isHost,
  selectedChat,
  selectChatCallback,
  t,
}: {
  chats: ChatInfo[];
  isHost: boolean;
  selectedChat?: ChatInfo;
  selectChatCallback: (tripId: number) => void;
  t: TFunction;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      {chats.map((chatInfo) => {
        return (
          <ChatInfoCard
            key={chatInfo.tripId}
            chatInfo={chatInfo}
            isHost={isHost}
            isSelected={chatInfo.tripId === selectedChat?.tripId}
            onClickCallback={() => {
              selectChatCallback(chatInfo.tripId);
            }}
            t={t}
          />
        );
      })}
    </div>
  );
}
