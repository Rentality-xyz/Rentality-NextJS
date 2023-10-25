import ChatPage from "@/components/chat/chatPage";
import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import PageTitle from "@/components/pageTitle/pageTitle";
import useChatInfos from "@/hooks/chat/useChatInfos";
import useRntDialogs from "@/hooks/useRntDialogs";

export default function Messages() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] =
    useRntDialogs();
  const [dataFetched, chats, sendMessage] = useChatInfos(true);

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Chats" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">
            Loading...
          </div>
        ) : (
          <ChatPage chats={chats} sendMessage={sendMessage} />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
