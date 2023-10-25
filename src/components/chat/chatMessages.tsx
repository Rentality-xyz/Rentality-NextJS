import { ChatInfo } from "@/model/ChatInfo";
import ChatMessage from "./chatMessage";

type Props = {
  selectedChat: ChatInfo;
  isHost: boolean;
};

export default function ChatMessages({
  selectedChat,
  isHost
}: Props) {
  const myPhotoUrl = isHost
    ? selectedChat.hostPhotoUrl
    : selectedChat.guestPhotoUrl;
  const myName = isHost
    ? selectedChat.hostName
    : selectedChat.guestName;
  const otherPhotoUrl = isHost
    ? selectedChat.guestPhotoUrl
    : selectedChat.hostPhotoUrl;
  const otherName = isHost
    ? selectedChat.guestName
    : selectedChat.hostName;
  const myAddress = isHost
    ? selectedChat.hostAddress
    : selectedChat.guestAddress;

    const isSendByMe = (address: string) => {
      return address.toLowerCase() === myAddress.toLowerCase();
    };

  return (
    <div className="my-4 flex flex-col gap-4 w-full">
      {selectedChat.messages.map((msgInfo, index) => {
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
    </div>
  );
}
