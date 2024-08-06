import { ChatInfo } from "@/model/ChatInfo";
import ChatMessage from "./ChatMessage";
import { decodeClaimChatMessage, isClaimChatMessage } from "./utils";
import { useEffect, useRef } from "react";

export default function ChatMessages({ selectedChat, isHost }: { selectedChat: ChatInfo; isHost: boolean }) {
  const myPhotoUrl = isHost ? selectedChat.hostPhotoUrl : selectedChat.guestPhotoUrl;
  const myName = isHost ? selectedChat.hostName : selectedChat.guestName;
  const otherPhotoUrl = isHost ? selectedChat.guestPhotoUrl : selectedChat.hostPhotoUrl;
  const otherName = isHost ? selectedChat.guestName : selectedChat.hostName;
  const myAddress = isHost ? selectedChat.hostAddress : selectedChat.guestAddress;

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  const isSendByMe = (address: string) => {
    return address.toLowerCase() === myAddress.toLowerCase();
  };

  return (
    <div className="my-4 flex w-full flex-col gap-4">
      {selectedChat.messages.map((msgInfo, index) => {
        const formatedMessage = isClaimChatMessage(msgInfo.message)
          ? decodeClaimChatMessage(msgInfo.message, selectedChat.hostName, selectedChat.carTitle)
          : msgInfo.message;
        return isSendByMe(msgInfo.fromAddress) ? (
          <ChatMessage
            key={index}
            photoUrl={myPhotoUrl}
            name={myName}
            datetime={msgInfo.datestamp}
            message={msgInfo.message}
            isMyMessage={true}
          />
        ) : (
          <ChatMessage
            key={index}
            photoUrl={otherPhotoUrl}
            name={otherName}
            datetime={msgInfo.datestamp}
            message={msgInfo.message}
            isMyMessage={false}
          />
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
