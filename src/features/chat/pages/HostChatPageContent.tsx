import ChatPage from "@/features/chat/components/ChatPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useChat } from "@/features/chat/contexts/chatContext";
import { isEmpty } from "@/utils/string";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

export default function HostChatPageContent() {
  const { isLoadingClient, chatInfos, selectChat, updateAllChats, sendMessage } = useChat();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const selectedTridId = Number(searchParams.get("tridId") ?? -1);
  if (selectedTridId >= 0) {
    selectChat(selectedTridId);
  }

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  const handleSelectChat = (tripId: number) => {
    const pageParams = tripId > 0 ? "?" + createQueryString("tridId", tripId.toString()) : "";
    router.push(pathname + pageParams, pathname + pageParams, { shallow: true, scroll: false });
  };

  const handleSendMessage = async (toAddress: string, tripId: number, message: string) => {
    if (isEmpty(message)) {
      return;
    }

    await sendMessage(toAddress, tripId, message);
  };

  useEffect(() => {
    updateAllChats();
  }, []);

  const sortedChatInfos = useMemo(() => {
    const copy = [...chatInfos];
    return copy.sort((a, b) => {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [chatInfos]);

  return (
    <>
      <PageTitle title={t("chat.title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoadingClient}>
          <ChatPage
            isHost={true}
            chats={sortedChatInfos}
            sendMessage={handleSendMessage}
            selectedTridId={selectedTridId}
            selectChat={handleSelectChat}
            t={(name, options) => {
              return t("chat." + name, options);
            }}
          />
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}
