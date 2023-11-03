import RntDialogs from "@/components/common/rntDialogs";
import HostLayout from "@/components/host/layout/hostLayout";
import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import useNotificationInfos from "@/hooks/notification/useNotificationInfos";
import useRntDialogs from "@/hooks/useRntDialogs";

export default function Notifications() {
  const [dialogState, showInfo, showError, showMessager, hideSnackbar] = useRntDialogs();
  const [dataFetched, notifications] = useNotificationInfos(true);

  return (
    <HostLayout>
      <div className="flex flex-col">
        <PageTitle title="Notifications" />
        {!dataFetched ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <NotificationPage notifications={notifications} />
        )}
      </div>
      <RntDialogs state={dialogState} hide={hideSnackbar} />
    </HostLayout>
  );
}
