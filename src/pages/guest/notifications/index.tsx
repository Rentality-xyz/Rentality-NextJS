import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useNotification } from "@/contexts/notification/notificationContext";
import { useTranslation } from "react-i18next";
import RntSuspense from "@/components/common/rntSuspense";

function Notifications() {
  const { isLoading, notifications } = useNotification();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("notifications.title")} />
      <RntSuspense isLoading={isLoading}>
        <NotificationPage notifications={notifications} />
      </RntSuspense>
    </>
  );
}

export default Notifications;
