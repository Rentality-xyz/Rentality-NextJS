import Layout from "@/components/layout/layout";
import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import useNotificationInfos from "@/hooks/notification/useNotificationInfos";

export default function Notifications() {
  const [isLoading, notifications] = useNotificationInfos(false);

  return (
    <Layout>
      <div className="flex flex-col">
        <PageTitle title="Notifications" />
        {isLoading ? (
          <div className="mt-5 flex max-w-screen-xl flex-wrap justify-between text-center">Loading...</div>
        ) : (
          <NotificationPage notifications={notifications} />
        )}
      </div>
    </Layout>
  );
}
