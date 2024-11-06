import NotificationPage from "@/components/notification/notificationPage";
import PageTitle from "@/components/pageTitle/pageTitle";
import { useNotification } from "@/contexts/notification/notificationContext";
import { useTranslation } from "react-i18next";
import CheckingLoadingAuth from "@/components/common/CheckingLoadingAuth";
import RntSuspense from "@/components/common/rntSuspense";

export default function Notifications() {
  const { isLoading, notifications } = useNotification();
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("notifications.title")} />
      <CheckingLoadingAuth>
        <RntSuspense isLoading={isLoading}>
          <NotificationPage notifications={notifications} />
        </RntSuspense>
      </CheckingLoadingAuth>
    </>
  );
}
