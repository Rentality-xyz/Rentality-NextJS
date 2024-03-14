import ChatPage from "@/components/chat/chatPage";
import Layout from "@/components/layout/layout";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useChat } from "@/contexts/chatContext";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import { DialogActions } from "@/utils/dialogActions";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Messages() {
  const { isLoading, chatInfos, getLatestChatInfos, sendMessage, isMyChatKeysSaved, saveMyChatKeys } = useChat();
  const { showDialog, hideDialogs } = useRntDialogs();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTridId = Number(searchParams.get("tridId") ?? -1);

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  const selectChat = (tripId: number) => {
    const pageParams = tripId > 0 ? "?" + createQueryString("tridId", tripId.toString()) : "";
    router.push(pathname + pageParams, pathname + pageParams, { shallow: true, scroll: false });
  };

  const handleSendMessage = async (toAddress: string, tripId: number, message: string) => {
    if (!isMyChatKeysSaved) {
      const action = (
        <>
          {DialogActions.Button("Save", () => {
            hideDialogs();
            saveMyChatKeys();
          })}
          {DialogActions.Cancel(hideDialogs)}
        </>
      );
      showDialog("To send and receive messages you have to generate and save encryption keys", action);
      return;
    }

    await sendMessage(toAddress, tripId, message);
  };

  useEffect(() => {
    getLatestChatInfos();
  }, [getLatestChatInfos]);

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Chats" />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <ChatPage
            isHost={true}
            chats={chatInfos}
            sendMessage={handleSendMessage}
            selectedTridId={selectedTridId}
            selectChat={selectChat}
          />
        )}
      </div>
    </Layout>
  );
}
