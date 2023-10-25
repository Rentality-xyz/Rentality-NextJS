import ChatHeader from "@/components/chat/chatHeader";
import ChatInfoCard from "@/components/chat/chatInfoCard";
import ChatList from "@/components/chat/chatList";
import ChatMessages from "@/components/chat/chatMessages";
import SendMessage from "@/components/chat/sendMessage";
import RntButton from "@/components/common/rntButton";
import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useChatInfos from "@/hooks/chat/useChatInfos";
import useRntDialogs from "@/hooks/useRntDialogs";
import { ChatInfo } from "@/model/ChatInfo";
import { useEffect, useState } from "react";

export default function Messages() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();
  const [dataFetched, chats, sendMessage] = useChatInfos(true);
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
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Chats" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <div className="flex flex-row gap-4 mt-5">
            {!isOpenChat && (
              <ChatList
                chats={chats}
                isHost={true}
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
                <div className="font-bold text-2xl">
                  {selectedChat.guestName}
                </div>
                <ChatHeader selectedChat={selectedChat} />
                <ChatMessages selectedChat={selectedChat} isHost={true} />
                <SendMessage
                  sendMessageCallback={async (message: string) => {
                    await sendMessage(
                      selectedChat.guestAddress,
                      selectedChat.tripId,
                      message
                    );
                  }}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
