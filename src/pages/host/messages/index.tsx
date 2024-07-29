import ChatPage from "@/components/chat/ChatPage";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useChat, useChatKeys } from "@/contexts/chat/firebase/chatContext";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { isEmpty } from "@/utils/string";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function Messages() {
  const { isLoadingClient, chatInfos, selectChat, updateAllChats, sendMessage } = useChat();
  const { isLoading: isChatKeysLoading, isChatKeysSaved, saveChatKeys } = useChatKeys();
  const { showInfo, showDialog, hideDialogs } = useRntDialogs();

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
    if (isChatKeysLoading) {
      showInfo(t("chat.loading_message"));
      return;
    }
    if (!isChatKeysSaved) {
      const action = (
        <>
          {DialogActions.Button(t("common.save"), () => {
            hideDialogs();
            saveChatKeys();
          })}
          {DialogActions.Cancel(hideDialogs)}
        </>
      );
      showDialog(t("chat.keys_message"), action);
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
    <Layout>
      <div className="flex flex-col">
        <PageTitle title={t("chat.title")} />
        {isLoadingClient ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            {t("common.info.loading")}
          </div>
        ) : (
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
        )}
      </div>
    </Layout>
  );
}
